import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { audit } from "../lib/audit.js";
import { notFound } from "../lib/errors.js";
import { normalizePhone } from "../lib/phone.js";
import {
  requireAuth,
  resolveWorkspace,
} from "../plugins/auth.js";

/* ---------- API shapes ---------- */

function toApiCallLog(l: {
  id: string;
  contactId: string | null;
  direction: string | null;
  phone: string;
  durationSec: number | null;
  note: string | null;
  recordingUrl: string | null;
  createdAt: Date;
  contact?: { name: string | null; phone: string } | null;
}) {
  return {
    id: l.id,
    contactId: l.contactId ?? undefined,
    contactName: l.contact?.name ?? undefined,
    phone: l.phone,
    direction: (l.direction as "inbound" | "outbound" | null) ?? undefined,
    durationSec: l.durationSec ?? undefined,
    note: l.note ?? undefined,
    recordingUrl: l.recordingUrl ?? undefined,
    at: l.createdAt.toISOString(),
  };
}

function toApiReminder(r: {
  id: string;
  contactId: string | null;
  contactName: string;
  phone: string;
  note: string;
  at: Date;
  done: boolean;
  createdAt: Date;
}) {
  return {
    id: r.id,
    contactId: r.contactId ?? undefined,
    contactName: r.contactName,
    phone: r.phone,
    note: r.note,
    at: r.at.toISOString(),
    done: r.done,
    createdAt: r.createdAt.toISOString(),
  };
}

/* ---------- schemas ---------- */

const logListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().trim().max(200).optional(),
  direction: z.enum(["inbound", "outbound"]).optional(),
});

const logCreateSchema = z.object({
  contactId: z.string().optional(),
  phone: z.string().trim().min(5).max(30),
  direction: z.enum(["inbound", "outbound"]).optional(),
  durationSec: z.number().int().min(0).max(86400).optional(),
  note: z.string().max(2000).optional(),
  recordingUrl: z.string().url().max(1000).optional(),
  /** When the call happened — defaults to now. */
  at: z.coerce.date().optional(),
});

const reminderListQuery = z.object({
  upcoming: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  includeDone: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

const reminderCreateSchema = z.object({
  contactId: z.string().optional(),
  contactName: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(5).max(30),
  note: z.string().max(1000).default(""),
  at: z.coerce.date(),
});

const reminderUpdateSchema = z.object({
  contactName: z.string().trim().min(1).max(200).optional(),
  phone: z.string().trim().min(5).max(30).optional(),
  note: z.string().max(1000).optional(),
  at: z.coerce.date().optional(),
  done: z.boolean().optional(),
});

export async function callRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", async (request, reply) => {
    await requireAuth(request, reply);
    await resolveWorkspace(request, reply);
  });

  /* ----- call logs ----- */

  fastify.get("/logs", async (request) => {
    const q = logListQuery.parse(request.query);
    const where: Prisma.CallLogWhereInput = { workspaceId: request.workspaceId };
    if (q.direction) where.direction = q.direction;
    if (q.search) {
      where.OR = [
        { phone: { contains: q.search.replace(/\s/g, "") } },
        { note: { contains: q.search, mode: "insensitive" } },
        { contact: { name: { contains: q.search, mode: "insensitive" } } },
      ];
    }
    const [total, rows] = await Promise.all([
      prisma.callLog.count({ where }),
      prisma.callLog.findMany({
        where,
        include: { contact: { select: { name: true, phone: true } } },
        orderBy: { createdAt: "desc" },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
    ]);
    return { items: rows.map(toApiCallLog), total, page: q.page, pageSize: q.pageSize };
  });

  fastify.post("/logs", async (request, reply) => {
    const input = logCreateSchema.parse(request.body);
    let contactId: string | null = null;
    if (input.contactId) {
      const contact = await prisma.contact.findFirst({
        where: { id: input.contactId, workspaceId: request.workspaceId },
        select: { id: true },
      });
      if (!contact) throw notFound("Contact not found");
      contactId = contact.id;
    }
    const log = await prisma.callLog.create({
      data: {
        workspaceId: request.workspaceId,
        contactId,
        direction: input.direction ?? null,
        phone: normalizePhone(input.phone) ?? input.phone.trim(),
        durationSec: input.durationSec ?? null,
        note: input.note ?? null,
        recordingUrl: input.recordingUrl ?? null,
        ...(input.at ? { createdAt: input.at } : {}),
      },
      include: { contact: { select: { name: true, phone: true } } },
    });
    await audit(prisma, {
      workspaceId: request.workspaceId,
      userId: request.userId,
      action: "call.logged",
      targetType: "call_log",
      targetId: log.id,
      ip: request.ip,
    });
    return reply.status(201).send(toApiCallLog(log));
  });

  fastify.delete("/logs/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = await prisma.callLog.findFirst({
      where: { id, workspaceId: request.workspaceId },
      select: { id: true },
    });
    if (!existing) throw notFound("Call log not found");
    await prisma.callLog.delete({ where: { id } });
    return reply.status(204).send();
  });

  /* ----- call reminders ----- */

  fastify.get("/reminders", async (request) => {
    const q = reminderListQuery.parse(request.query);
    const where: Prisma.CallReminderWhereInput = { workspaceId: request.workspaceId };
    if (!q.includeDone) where.done = false;
    if (q.upcoming) where.at = { gte: new Date() };
    const rows = await prisma.callReminder.findMany({
      where,
      orderBy: { at: "asc" },
      take: 200,
    });
    return rows.map(toApiReminder);
  });

  fastify.post("/reminders", async (request, reply) => {
    const input = reminderCreateSchema.parse(request.body);
    let contactId: string | null = null;
    if (input.contactId) {
      const contact = await prisma.contact.findFirst({
        where: { id: input.contactId, workspaceId: request.workspaceId },
        select: { id: true },
      });
      if (!contact) throw notFound("Contact not found");
      contactId = contact.id;
    }
    const reminder = await prisma.callReminder.create({
      data: {
        workspaceId: request.workspaceId,
        contactId,
        contactName: input.contactName,
        phone: normalizePhone(input.phone) ?? input.phone.trim(),
        note: input.note,
        at: input.at,
        createdById: request.userId,
      },
    });
    return reply.status(201).send(toApiReminder(reminder));
  });

  fastify.patch("/reminders/:id", async (request) => {
    const { id } = request.params as { id: string };
    const input = reminderUpdateSchema.parse(request.body);
    const existing = await prisma.callReminder.findFirst({
      where: { id, workspaceId: request.workspaceId },
    });
    if (!existing) throw notFound("Reminder not found");
    const reminder = await prisma.callReminder.update({
      where: { id },
      data: {
        ...(input.contactName !== undefined ? { contactName: input.contactName } : {}),
        ...(input.phone !== undefined
          ? { phone: normalizePhone(input.phone) ?? input.phone.trim() }
          : {}),
        ...(input.note !== undefined ? { note: input.note } : {}),
        ...(input.at !== undefined ? { at: input.at } : {}),
        ...(input.done !== undefined ? { done: input.done } : {}),
      },
    });
    return toApiReminder(reminder);
  });

  fastify.delete("/reminders/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = await prisma.callReminder.findFirst({
      where: { id, workspaceId: request.workspaceId },
      select: { id: true },
    });
    if (!existing) throw notFound("Reminder not found");
    await prisma.callReminder.delete({ where: { id } });
    return reply.status(204).send();
  });
}
