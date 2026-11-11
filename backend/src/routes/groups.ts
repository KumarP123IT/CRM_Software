import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { audit } from "../lib/audit.js";
import { matchesRules, type GroupRule } from "../lib/group-rules.js";
import { badRequest, notFound } from "../lib/errors.js";
import {
  requireAuth,
  resolveWorkspace,
  requirePermission,
} from "../plugins/auth.js";

const ruleSchema = z.object({
  field: z.string().max(40),
  operator: z.enum([
    "equals",
    "not_equals",
    "contains",
    "not_contains",
    "greater_than",
    "less_than",
    "is_empty",
    "is_not_empty",
  ]),
  value: z.string().max(500).default(""),
  logic: z.enum(["AND", "OR"]).optional(),
});

const groupInput = z.object({
  name: z.string().trim().min(1).max(120),
  kind: z.enum(["static", "dynamic"]).default("static"),
  rules: z.array(ruleSchema).max(20).optional(),
});

const contactInclude = {
  tags: { include: { tag: { select: { name: true } } } },
} satisfies Prisma.ContactInclude;

async function memberCount(workspaceId: string, group: {
  id: string;
  kind: string;
  rules: Prisma.JsonValue | null;
}): Promise<number> {
  if (group.kind === "static") {
    return prisma.contactGroupMember.count({ where: { groupId: group.id } });
  }
  const rules = (Array.isArray(group.rules) ? group.rules : []) as unknown as GroupRule[];
  const all = await prisma.contact.findMany({
    where: { workspaceId },
    include: contactInclude,
    take: 10000,
  });
  return all.filter((c) =>
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
  ).length;
}

function toApiGroup(
  g: { id: string; name: string; kind: string; rules: Prisma.JsonValue | null; createdAt: Date },
  count: number,
) {
  return {
    id: g.id,
    name: g.name,
    kind: g.kind,
    memberCount: count,
    rules: Array.isArray(g.rules) ? g.rules : undefined,
    createdAt: g.createdAt.toISOString(),
  };
}

export async function groupRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", async (request, reply) => {
    await requireAuth(request, reply);
    await resolveWorkspace(request, reply);
  });

  fastify.get("/", async (request) => {
    const groups = await prisma.contactGroup.findMany({
      where: { workspaceId: request.workspaceId },
      orderBy: { name: "asc" },
    });
    const items = await Promise.all(
      groups.map(async (g) => toApiGroup(g, await memberCount(request.workspaceId, g))),
    );
    return items;
  });

  fastify.post("/", { preHandler: requirePermission("contact.create") }, async (request, reply) => {
    const input = groupInput.parse(request.body);
    const group = await prisma.contactGroup.create({
      data: {
        workspaceId: request.workspaceId,
        name: input.name,
        kind: input.kind,
        ...(input.rules ? { rules: input.rules } : {}),
      },
    });
    return reply.status(201).send(toApiGroup(group, 0));
  });

  fastify.get("/:id", async (request) => {
    const { id } = request.params as { id: string };
    const group = await prisma.contactGroup.findFirst({
      where: { id, workspaceId: request.workspaceId },
    });
    if (!group) throw notFound("Group not found");

    let members;
    if (group.kind === "static") {
      members = await prisma.contact.findMany({
        where: { groups: { some: { groupId: group.id } } },
        include: contactInclude,
        orderBy: { name: "asc" },
        take: 500,
      });
    } else {
      const rules = (Array.isArray(group.rules) ? group.rules : []) as unknown as GroupRule[];
      const all = await prisma.contact.findMany({
        where: { workspaceId: request.workspaceId },
        include: contactInclude,
        take: 10000,
      });
      members = all.filter((c) =>
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
    }
    const count = await memberCount(request.workspaceId, group);
    return {
      ...toApiGroup(group, count),
      members: members.map((c) => ({
        id: c.id,
        name: c.name ?? "",
        phone: c.phone,
        email: c.email ?? undefined,
        city: c.city ?? "",
        tags: c.tags.map((t) => t.tag.name),
        optedIn: !c.optedOut,
      })),
    };
  });

  fastify.patch("/:id", { preHandler: requirePermission("contact.create") }, async (request) => {
    const { id } = request.params as { id: string };
    const input = groupInput.partial().parse(request.body);
    const existing = await prisma.contactGroup.findFirst({
      where: { id, workspaceId: request.workspaceId },
    });
    if (!existing) throw notFound("Group not found");
    const group = await prisma.contactGroup.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.kind !== undefined ? { kind: input.kind } : {}),
        ...(input.rules !== undefined ? { rules: input.rules } : {}),
      },
    });
    const count = await memberCount(request.workspaceId, group);
    return toApiGroup(group, count);
  });

  fastify.delete("/:id", { preHandler: requirePermission("contact.delete") }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = await prisma.contactGroup.findFirst({
      where: { id, workspaceId: request.workspaceId },
    });
    if (!existing) throw notFound("Group not found");
    await prisma.contactGroup.delete({ where: { id } });
    await audit(prisma, {
      workspaceId: request.workspaceId,
      userId: request.userId,
      action: "group.deleted",
      targetType: "contact_group",
      targetId: id,
      ip: request.ip,
    });
    return reply.status(204).send();
  });

  const memberIdsSchema = z.object({ contactIds: z.array(z.string()).min(1).max(5000) });

  fastify.post("/:id/members", { preHandler: requirePermission("contact.create") }, async (request) => {
    const { id } = request.params as { id: string };
    const { contactIds } = memberIdsSchema.parse(request.body);
    const group = await prisma.contactGroup.findFirst({
      where: { id, workspaceId: request.workspaceId },
    });
    if (!group) throw notFound("Group not found");
    if (group.kind !== "static") {
      throw badRequest("dynamic_group", "Dynamic group membership is rule-based");
    }
    // Only link contacts that belong to this workspace.
    const valid = await prisma.contact.findMany({
      where: { id: { in: contactIds }, workspaceId: request.workspaceId },
      select: { id: true },
    });
    await prisma.contactGroupMember.createMany({
      data: valid.map((c) => ({ groupId: group.id, contactId: c.id })),
      skipDuplicates: true,
    });
    const count = await memberCount(request.workspaceId, group);
    return { added: valid.length, memberCount: count };
  });

  fastify.delete("/:id/members", { preHandler: requirePermission("contact.create") }, async (request) => {
    const { id } = request.params as { id: string };
    const { contactIds } = memberIdsSchema.parse(request.body);
    const group = await prisma.contactGroup.findFirst({
      where: { id, workspaceId: request.workspaceId },
    });
    if (!group) throw notFound("Group not found");
    const res = await prisma.contactGroupMember.deleteMany({
      where: { groupId: group.id, contactId: { in: contactIds } },
    });
    const count = await memberCount(request.workspaceId, group);
    return { removed: res.count, memberCount: count };
  });
}
