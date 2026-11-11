import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { audit } from "../lib/audit.js";
import { normalizePhone } from "../lib/phone.js";
import { parseCsv, toCsv } from "../lib/csv.js";
import { matchesRules, type GroupRule } from "../lib/group-rules.js";
import { badRequest, notFound } from "../lib/errors.js";
import {
  requireAuth,
  resolveWorkspace,
  requirePermission,
} from "../plugins/auth.js";

/* ---------- API shape (mirrors frontend Contact contract) ---------- */

const customFieldSchema = z.object({ label: z.string(), value: z.string() });

const contactInclude = {
  tags: { include: { tag: { select: { name: true, color: true } } } },
} satisfies Prisma.ContactInclude;

type ContactWithTags = Prisma.ContactGetPayload<{ include: typeof contactInclude }>;

function toApiContact(c: ContactWithTags) {
  return {
    id: c.id,
    name: c.name ?? "",
    phone: c.phone,
    email: c.email ?? undefined,
    city: c.city ?? "",
    country: c.country,
    company: c.company ?? undefined,
    designation: c.designation ?? undefined,
    source: c.source,
    optedOut: c.optedOut,
    optedIn: !c.optedOut,
    tags: c.tags.map((t) => t.tag.name),
    tagDetails: c.tags.map((t) => ({ id: t.tagId, name: t.tag.name, color: t.tag.color ?? undefined })),
    lifetimeValue: Number(c.lifetimeValue),
    lastSeenAt: c.lastSeenAt.toISOString(),
    createdAt: c.createdAt.toISOString(),
    customFields: Array.isArray(c.customFields) ? c.customFields : [],
    notes: c.notes,
  };
}

/* ---------- input schemas ---------- */

const createSchema = z.object({
  name: z.string().trim().max(200).optional(),
  phone: z.string().trim().min(5).max(30),
  email: z.string().trim().toLowerCase().email().max(255).optional().or(z.literal("")),
  company: z.string().trim().max(200).optional(),
  designation: z.string().trim().max(200).optional(),
  country: z.string().trim().length(2).optional(),
  city: z.string().trim().max(120).optional(),
  source: z.string().trim().max(60).optional(),
  optedOut: z.boolean().optional(),
  tags: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
  customFields: z.array(customFieldSchema).max(50).optional(),
  notes: z.string().max(5000).optional(),
  createLead: z.boolean().optional(),
  leadTitle: z.string().trim().max(200).optional(),
});

const updateSchema = createSchema.partial().omit({ phone: true, createLead: true, leadTitle: true });

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(25),
  search: z.string().trim().max(200).optional(),
  tag: z.string().trim().max(60).optional(),
  source: z.string().trim().max(60).optional(),
  optedOut: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  groupId: z.string().optional(),
});

const bulkSchema = z.object({
  ids: z.array(z.string()).min(1).max(5000),
  action: z.enum([
    "addTags",
    "removeTags",
    "setOptedOut",
    "addToGroup",
    "removeFromGroup",
    "delete",
  ]),
  tags: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
  groupId: z.string().optional(),
  optedOut: z.boolean().optional(),
});

const importCommitSchema = z.object({
  rows: z.array(createSchema).min(1).max(5000),
});

/* ---------- helpers ---------- */

async function tagIdsByName(workspaceId: string, names: string[]): Promise<string[]> {
  const ids: string[] = [];
  for (const name of names) {
    const tag = await prisma.tag.upsert({
      where: { workspaceId_name: { workspaceId, name } },
      update: {},
      create: { workspaceId, name },
    });
    ids.push(tag.id);
  }
  return ids;
}

async function syncContactTags(
  tx: Prisma.TransactionClient,
  contactId: string,
  tagIds: string[],
) {
  await tx.contactTag.deleteMany({ where: { contactId } });
  if (tagIds.length) {
    await tx.contactTag.createMany({
      data: tagIds.map((tagId) => ({ contactId, tagId })),
      skipDuplicates: true,
    });
  }
}

/** Contact fields shared by create/update/import upsert. */
function contactData(input: z.infer<typeof createSchema>, workspaceId: string) {
  return {
    workspaceId,
    name: input.name ?? null,
    phone: normalizePhone(input.phone) ?? input.phone.trim(),
    email: input.email || null,
    company: input.company ?? null,
    designation: input.designation ?? null,
    country: input.country ?? "IN",
    city: input.city ?? null,
    source: input.source ?? "manual",
    optedOut: input.optedOut ?? false,
    notes: input.notes ?? "",
    ...(input.customFields ? { customFields: input.customFields } : {}),
  };
}

/* ---------- routes ---------- */

export async function contactRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", async (request, reply) => {
    await requireAuth(request, reply);
    await resolveWorkspace(request, reply);
  });

  // GET /contacts — paginated, searchable, filterable
  fastify.get("/", async (request) => {
    const q = listQuerySchema.parse(request.query);
    const ws = request.workspaceId;

    // Resolve groupId → contact ids for static, or rule-eval for dynamic.
    let groupContactIds: string[] | null = null;
    if (q.groupId) {
      const group = await prisma.contactGroup.findFirst({
        where: { id: q.groupId, workspaceId: ws },
      });
      if (!group) throw notFound("Group not found");
      if (group.kind === "static") {
        const members = await prisma.contactGroupMember.findMany({
          where: { groupId: group.id },
          select: { contactId: true },
        });
        groupContactIds = members.map((m) => m.contactId);
        if (groupContactIds.length === 0) {
          return { items: [], total: 0, page: q.page, pageSize: q.pageSize };
        }
      }
      // dynamic handled below via post-filter
    }

    const where: Prisma.ContactWhereInput = { workspaceId: ws };
    if (q.search) {
      where.OR = [
        { name: { contains: q.search, mode: "insensitive" } },
        { phone: { contains: q.search.replace(/\s/g, "") } },
        { email: { contains: q.search, mode: "insensitive" } },
      ];
    }
    if (q.source) where.source = q.source;
    if (q.optedOut !== undefined) where.optedOut = q.optedOut;
    if (q.tag) {
      where.tags = { some: { tag: { name: q.tag } } };
    }
    if (groupContactIds) where.id = { in: groupContactIds };

    const dynamicGroup = q.groupId
      ? await prisma.contactGroup.findFirst({
          where: { id: q.groupId, workspaceId: ws, kind: "dynamic" },
          select: { id: true, rules: true },
        })
      : null;

    if (dynamicGroup) {
      // Evaluate rules across all workspace contacts (bounded — CRM scale).
      const rules = (Array.isArray(dynamicGroup.rules)
        ? dynamicGroup.rules
        : []) as unknown as GroupRule[];
      const all = await prisma.contact.findMany({
        where,
        include: contactInclude,
        orderBy: { createdAt: "desc" },
        take: 10000,
      });
      const matched = all.filter((c) =>
        matchesRules(
          {
            name: c.name,
            phone: c.phone,
            email: c.email,
            city: c.city,
            company: c.company,
            source: c.source,
            optedOut: c.optedOut,
            lifetimeValue: c.lifetimeValue,
            lastSeenAt: c.lastSeenAt,
            tags: c.tags.map((t) => t.tag.name),
          },
          rules,
        ),
      );
      const items = matched.slice((q.page - 1) * q.pageSize, q.page * q.pageSize);
      return { items: items.map(toApiContact), total: matched.length, page: q.page, pageSize: q.pageSize };
    }

    const [total, rows] = await Promise.all([
      prisma.contact.count({ where }),
      prisma.contact.findMany({
        where,
        include: contactInclude,
        orderBy: { createdAt: "desc" },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
    ]);
    return { items: rows.map(toApiContact), total, page: q.page, pageSize: q.pageSize };
  });

  // GET /contacts/export — CSV of all matching contacts (same filters, no pagination)
  fastify.get("/export", async (request, reply) => {
    const q = listQuerySchema
      .omit({ page: true, pageSize: true })
      .extend({ ids: z.string().optional() })
      .parse(request.query);
    const where: Prisma.ContactWhereInput = { workspaceId: request.workspaceId };
    if (q.ids) {
      where.id = { in: q.ids.split(",").filter(Boolean).slice(0, 5000) };
    }
    if (q.search) {
      where.OR = [
        { name: { contains: q.search, mode: "insensitive" } },
        { phone: { contains: q.search.replace(/\s/g, "") } },
        { email: { contains: q.search, mode: "insensitive" } },
      ];
    }
    if (q.source) where.source = q.source;
    if (q.optedOut !== undefined) where.optedOut = q.optedOut;
    if (q.tag) where.tags = { some: { tag: { name: q.tag } } };
    // groupId intentionally not applied to export (membership lists are for broadcast audiences)

    const rows = await prisma.contact.findMany({
      where,
      include: contactInclude,
      orderBy: { createdAt: "desc" },
      take: 10000,
    });
    const csv = toCsv(
      ["name", "phone", "email", "city", "company", "designation", "country", "tags", "optedOut", "source", "lifetimeValue", "createdAt"],
      rows.map((c) => [
        c.name ?? "",
        c.phone,
        c.email ?? "",
        c.city ?? "",
        c.company ?? "",
        c.designation ?? "",
        c.country,
        c.tags.map((t) => t.tag.name).join(";"),
        c.optedOut ? "true" : "false",
        c.source,
        Number(c.lifetimeValue),
        c.createdAt.toISOString(),
      ]),
    );
    reply.header("content-type", "text/csv; charset=utf-8");
    reply.header("content-disposition", 'attachment; filename="contacts.csv"');
    return reply.send(csv);
  });

  // POST /contacts/import/preview — parse + validate + dedupe report
  fastify.post("/import/preview", async (request) => {
    const body = z.object({ csv: z.string().min(1).max(5_000_000) }).parse(request.body);
    const ws = request.workspaceId;
    const table = parseCsv(body.csv);
    if (table.length < 2) {
      throw badRequest("empty_csv", "CSV must have a header row and at least one data row");
    }
    const headers = table[0]!.map((h) => h.trim().toLowerCase());
    const col = (names: string[]) => headers.findIndex((h) => names.includes(h));
    const idx = {
      name: col(["name", "full name", "fullname"]),
      phone: col(["phone", "phone number", "mobile", "contact", "whatsapp"]),
      email: col(["email", "e-mail", "email address"]),
      city: col(["city"]),
      company: col(["company", "business", "organization"]),
      designation: col(["designation", "role", "title", "job title"]),
      country: col(["country"]),
      tags: col(["tags", "tag", "labels"]),
      source: col(["source"]),
      optedOut: col(["optedout", "opted out", "opt-out", "unsubscribed"]),
    };
    if (idx.phone === -1) {
      throw badRequest("missing_phone", "CSV must contain a phone column");
    }

    const cell = (row: string[], i: number) => (i >= 0 ? (row[i] ?? "").trim() : "");
    const existing = await prisma.contact.findMany({
      where: { workspaceId: ws },
      select: { id: true, phone: true },
    });
    const existingPhones = new Set(existing.map((c) => c.phone));

    const seen = new Set<string>();
    const rows = table.slice(1).map((r, i) => {
      const rawPhone = cell(r, idx.phone);
      const phone = normalizePhone(rawPhone);
      const errors: string[] = [];
      let status: "new" | "duplicate" | "invalid" = "new";
      if (!phone) {
        errors.push("Invalid or missing phone number");
        status = "invalid";
      } else if (seen.has(phone)) {
        errors.push("Duplicate phone within file");
        status = "duplicate";
      } else {
        seen.add(phone);
        if (existingPhones.has(phone)) status = "duplicate";
      }
      const email = cell(r, idx.email);
      if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        errors.push("Invalid email");
        if (status === "new") status = "invalid";
      }
      const existingId = status === "duplicate" ? existing.find((c) => c.phone === phone)?.id : undefined;
      return {
        index: i + 2, // 1-based, accounting for header
        status,
        errors,
        ...(existingId ? { existingId } : {}),
        data: {
          name: cell(r, idx.name) || undefined,
          phone: phone ?? rawPhone,
          email: email || undefined,
          city: cell(r, idx.city) || undefined,
          company: cell(r, idx.company) || undefined,
          designation: cell(r, idx.designation) || undefined,
          country: cell(r, idx.country) || undefined,
          tags: cell(r, idx.tags)
            ? cell(r, idx.tags).split(/[;,]/).map((t) => t.trim()).filter(Boolean)
            : undefined,
          source: cell(r, idx.source) || "import",
          optedOut: /^(true|yes|1|opted ?out)$/i.test(cell(r, idx.optedOut)),
        },
      };
    });

    return {
      rows,
      totals: {
        total: rows.length,
        new: rows.filter((r) => r.status === "new").length,
        duplicates: rows.filter((r) => r.status === "duplicate").length,
        invalid: rows.filter((r) => r.status === "invalid").length,
      },
    };
  });

  // POST /contacts/import/commit — upsert validated rows
  fastify.post(
    "/import/commit",
    { preHandler: requirePermission("contact.create") },
    async (request) => {
      const { rows } = importCommitSchema.parse(request.body);
      const ws = request.workspaceId;
      let created = 0;
      let updated = 0;

      for (const row of rows) {
        const data = contactData(row, ws);
        const existing = await prisma.contact.findUnique({
          where: { workspaceId_phone: { workspaceId: ws, phone: data.phone } },
        });
        const tagIds = row.tags?.length ? await tagIdsByName(ws, row.tags) : [];
        if (existing) {
          await prisma.$transaction(async (tx) => {
            await tx.contact.update({ where: { id: existing.id }, data });
            if (row.tags) await syncContactTags(tx, existing.id, tagIds);
          });
          updated++;
        } else {
          const contact = await prisma.contact.create({ data });
          if (tagIds.length) {
            await prisma.contactTag.createMany({
              data: tagIds.map((tagId) => ({ contactId: contact.id, tagId })),
              skipDuplicates: true,
            });
          }
          created++;
        }
      }
      await audit(prisma, {
        workspaceId: ws,
        userId: request.userId,
        action: "contacts.imported",
        meta: { created, updated },
        ip: request.ip,
      });
      return { created, updated, skipped: 0 };
    },
  );

  // POST /contacts/bulk — bulk actions on selected ids
  fastify.post(
    "/bulk",
    { preHandler: requirePermission("contact.create") },
    async (request) => {
      const body = bulkSchema.parse(request.body);
      const ws = request.workspaceId;
      const scope = { id: { in: body.ids }, workspaceId: ws };

      switch (body.action) {
        case "addTags": {
          const tagIds = body.tags?.length ? await tagIdsByName(ws, body.tags) : [];
          const contacts = await prisma.contact.findMany({ where: scope, select: { id: true } });
          for (const c of contacts) {
            await prisma.contactTag.createMany({
              data: tagIds.map((tagId) => ({ contactId: c.id, tagId })),
              skipDuplicates: true,
            });
          }
          break;
        }
        case "removeTags": {
          const tags = await prisma.tag.findMany({
            where: { workspaceId: ws, name: { in: body.tags ?? [] } },
            select: { id: true },
          });
          await prisma.contactTag.deleteMany({
            where: { contactId: { in: body.ids }, tagId: { in: tags.map((t) => t.id) } },
          });
          break;
        }
        case "setOptedOut":
          await prisma.contact.updateMany({ where: scope, data: { optedOut: body.optedOut ?? true } });
          break;
        case "addToGroup": {
          if (!body.groupId) throw badRequest("missing_group", "groupId is required");
          const group = await prisma.contactGroup.findFirst({
            where: { id: body.groupId, workspaceId: ws },
          });
          if (!group) throw notFound("Group not found");
          if (group.kind !== "static") {
            throw badRequest("dynamic_group", "Cannot manually edit a dynamic group");
          }
          await prisma.contactGroupMember.createMany({
            data: body.ids.map((contactId) => ({ groupId: group.id, contactId })),
            skipDuplicates: true,
          });
          break;
        }
        case "removeFromGroup": {
          if (!body.groupId) throw badRequest("missing_group", "groupId is required");
          await prisma.contactGroupMember.deleteMany({
            where: { groupId: body.groupId, contactId: { in: body.ids } },
          });
          break;
        }
        case "delete":
          break;
      }

      let affected = body.ids.length;
      if (body.action === "delete") {
        const del = requirePermission("contact.delete");
        await del(request, {} as never);
        const { count } = await prisma.contact.deleteMany({ where: scope });
        affected = count;
      }
      await audit(prisma, {
        workspaceId: ws,
        userId: request.userId,
        action: `contacts.bulk_${body.action}`,
        meta: { count: body.ids.length },
        ip: request.ip,
      });
      return { affected };
    },
  );

  // GET /contacts/:id
  fastify.get("/:id", async (request) => {
    const { id } = request.params as { id: string };
    const contact = await prisma.contact.findFirst({
      where: { id, workspaceId: request.workspaceId },
      include: contactInclude,
    });
    if (!contact) throw notFound("Contact not found");
    return toApiContact(contact);
  });

  // POST /contacts — create (optionally also create a lead)
  fastify.post(
    "/",
    { preHandler: requirePermission("contact.create") },
    async (request, reply) => {
      const input = createSchema.parse(request.body);
      const ws = request.workspaceId;
      const data = contactData(input, ws);
      const tagIds = input.tags?.length ? await tagIdsByName(ws, input.tags) : [];

      const contact = await prisma.$transaction(async (tx) => {
        const created = await tx.contact.upsert({
          where: { workspaceId_phone: { workspaceId: ws, phone: data.phone } },
          update: data,
          create: data,
        });
        if (input.tags) await syncContactTags(tx, created.id, tagIds);
        if (input.createLead) {
          await tx.lead.create({
            data: {
              workspaceId: ws,
              contactId: created.id,
              title: input.leadTitle ?? `New lead — ${created.name ?? created.phone}`,
              ownerId: request.userId,
            },
          });
        }
        return created;
      });

      const full = await prisma.contact.findUniqueOrThrow({
        where: { id: contact.id },
        include: contactInclude,
      });
      await audit(prisma, {
        workspaceId: ws,
        userId: request.userId,
        action: "contact.created",
        targetType: "contact",
        targetId: contact.id,
        ip: request.ip,
      });
      return reply.status(201).send(toApiContact(full));
    },
  );

  // PATCH /contacts/:id
  fastify.patch(
    "/:id",
    { preHandler: requirePermission("contact.create") },
    async (request) => {
      const { id } = request.params as { id: string };
      const input = updateSchema.parse(request.body);
      const ws = request.workspaceId;

      const existing = await prisma.contact.findFirst({
        where: { id, workspaceId: ws },
        include: contactInclude,
      });
      if (!existing) throw notFound("Contact not found");

      const data: Prisma.ContactUpdateInput = {};
      if (input.name !== undefined) data.name = input.name || null;
      if (input.email !== undefined) data.email = input.email || null;
      if (input.company !== undefined) data.company = input.company || null;
      if (input.designation !== undefined) data.designation = input.designation || null;
      if (input.country !== undefined) data.country = input.country;
      if (input.city !== undefined) data.city = input.city || null;
      if (input.source !== undefined) data.source = input.source;
      if (input.optedOut !== undefined) data.optedOut = input.optedOut;
      if (input.notes !== undefined) data.notes = input.notes;
      if (input.customFields !== undefined) data.customFields = input.customFields;

      const tagIds = input.tags !== undefined ? await tagIdsByName(ws, input.tags) : null;
      await prisma.$transaction(async (tx) => {
        await tx.contact.update({ where: { id }, data });
        if (tagIds) await syncContactTags(tx, id, tagIds);
      });

      const full = await prisma.contact.findUniqueOrThrow({
        where: { id },
        include: contactInclude,
      });
      await audit(prisma, {
        workspaceId: ws,
        userId: request.userId,
        action: "contact.updated",
        targetType: "contact",
        targetId: id,
        ip: request.ip,
      });
      return toApiContact(full);
    },
  );

  // PATCH /contacts/:id/notes — contract endpoint
  fastify.patch("/:id/notes", async (request) => {
    const { id } = request.params as { id: string };
    const { notes } = z.object({ notes: z.string().max(5000) }).parse(request.body);
    const existing = await prisma.contact.findFirst({
      where: { id, workspaceId: request.workspaceId },
    });
    if (!existing) throw notFound("Contact not found");
    const updated = await prisma.contact.update({
      where: { id },
      data: { notes },
      include: contactInclude,
    });
    return toApiContact(updated);
  });

  // DELETE /contacts/:id
  fastify.delete(
    "/:id",
    { preHandler: requirePermission("contact.delete") },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const existing = await prisma.contact.findFirst({
        where: { id, workspaceId: request.workspaceId },
      });
      if (!existing) throw notFound("Contact not found");
      await prisma.contact.delete({ where: { id } });
      await audit(prisma, {
        workspaceId: request.workspaceId,
        userId: request.userId,
        action: "contact.deleted",
        targetType: "contact",
        targetId: id,
        ip: request.ip,
      });
      return reply.status(204).send();
    },
  );
}
