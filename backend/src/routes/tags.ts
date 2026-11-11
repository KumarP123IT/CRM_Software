import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { audit } from "../lib/audit.js";
import { notFound } from "../lib/errors.js";
import {
  requireAuth,
  resolveWorkspace,
  requirePermission,
} from "../plugins/auth.js";

const tagInput = z.object({
  name: z.string().trim().min(1).max(60),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
});

const tagInclude = { _count: { select: { contacts: true } } } as const;

function toApiTag(t: { id: string; name: string; color: string | null; _count?: { contacts: number } }) {
  return {
    id: t.id,
    name: t.name,
    color: t.color ?? undefined,
    contactCount: t._count?.contacts ?? 0,
  };
}

export async function tagRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", async (request, reply) => {
    await requireAuth(request, reply);
    await resolveWorkspace(request, reply);
  });

  fastify.get("/", async (request) => {
    const tags = await prisma.tag.findMany({
      where: { workspaceId: request.workspaceId },
      include: tagInclude,
      orderBy: { name: "asc" },
    });
    return tags.map(toApiTag);
  });

  fastify.post("/", { preHandler: requirePermission("contact.create") }, async (request, reply) => {
    const input = tagInput.parse(request.body);
    const tag = await prisma.tag.upsert({
      where: { workspaceId_name: { workspaceId: request.workspaceId, name: input.name } },
      update: { ...(input.color ? { color: input.color } : {}) },
      create: { workspaceId: request.workspaceId, name: input.name, ...(input.color ? { color: input.color } : {}) },
      include: tagInclude,
    });
    return reply.status(201).send(toApiTag(tag));
  });

  fastify.patch("/:id", { preHandler: requirePermission("contact.create") }, async (request) => {
    const { id } = request.params as { id: string };
    const input = tagInput.partial().parse(request.body);
    const existing = await prisma.tag.findFirst({
      where: { id, workspaceId: request.workspaceId },
    });
    if (!existing) throw notFound("Tag not found");
    const tag = await prisma.tag.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.color !== undefined ? { color: input.color } : {}),
      },
      include: tagInclude,
    });
    return toApiTag(tag);
  });

  fastify.delete("/:id", { preHandler: requirePermission("contact.delete") }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = await prisma.tag.findFirst({
      where: { id, workspaceId: request.workspaceId },
    });
    if (!existing) throw notFound("Tag not found");
    await prisma.tag.delete({ where: { id } }); // ContactTag cascades
    await audit(prisma, {
      workspaceId: request.workspaceId,
      userId: request.userId,
      action: "tag.deleted",
      targetType: "tag",
      targetId: id,
      ip: request.ip,
    });
    return reply.status(204).send();
  });
}
