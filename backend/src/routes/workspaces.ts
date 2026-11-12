import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { audit } from "../lib/audit.js";
import { resolveWorkspace, requirePermission, requireAuth } from "../plugins/auth.js";

const domainSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(255)
  .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/, "Must be a bare domain like example.com");

const tunableMinutes = z.number().int().min(0).max(10080);

const updateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  city: z.string().trim().max(120).optional(),
  widgetAllowedDomains: z.array(domainSchema).max(50).optional(),
  slaMinutes: tunableMinutes.optional(),
  autoCloseMinutes: tunableMinutes.optional(),
});

const workspaceSelect = {
  id: true,
  name: true,
  slug: true,
  plan: true,
  city: true,
  widgetAllowedDomains: true,
  slaMinutes: true,
  autoCloseMinutes: true,
} as const;

export async function workspaceRoutes(fastify: FastifyInstance) {
  // All workspace routes require auth; :workspaceId routes resolve membership.
  fastify.addHook("preHandler", requireAuth);

  fastify.get("/", async (request) => {
    const memberships = await prisma.membership.findMany({
      where: { userId: request.userId },
      include: {
        workspace: { select: workspaceSelect },
      },
      orderBy: { createdAt: "asc" },
    });
    return memberships.map((m) => ({ ...m.workspace, role: m.role }));
  });

  fastify.get(
    "/:workspaceId",
    { preHandler: resolveWorkspace },
    async (request) => {
      const workspace = await prisma.workspace.findUniqueOrThrow({
        where: { id: request.workspaceId },
        select: workspaceSelect,
      });
      return { ...workspace, role: request.membershipRole };
    },
  );

  fastify.patch(
    "/:workspaceId",
    { preHandler: [resolveWorkspace, requirePermission("settings.manage")] },
    async (request, reply) => {
      const body = updateSchema.parse(request.body);
      const workspace = await prisma.workspace.update({
        where: { id: request.workspaceId },
        data: {
          ...(body.name !== undefined ? { name: body.name } : {}),
          ...(body.city !== undefined ? { city: body.city } : {}),
          ...(body.widgetAllowedDomains !== undefined ? { widgetAllowedDomains: body.widgetAllowedDomains } : {}),
          ...(body.slaMinutes !== undefined ? { slaMinutes: body.slaMinutes } : {}),
          ...(body.autoCloseMinutes !== undefined ? { autoCloseMinutes: body.autoCloseMinutes } : {}),
        },
        select: workspaceSelect,
      });
      await audit(prisma, {
        workspaceId: request.workspaceId,
        userId: request.userId,
        action: "workspace.updated",
        targetType: "workspace",
        targetId: workspace.id,
        meta: body,
        ip: request.ip,
      });
      return reply.send({ ...workspace, role: request.membershipRole });
    },
  );
}
