import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { audit } from "../lib/audit.js";
import { badRequest, notFound } from "../lib/errors.js";
import { parseBotTrigger } from "../lib/automation.js";
import {
  requireAuth,
  resolveWorkspace,
  requirePermission,
} from "../plugins/auth.js";

const triggerSchema = z.object({
  type: z.enum(["first_message", "keyword", "outside_hours"]),
  keywords: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
  response: z.string().trim().min(1).max(2000),
});

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  trigger: triggerSchema,
  active: z.boolean().optional(),
});

const updateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  trigger: triggerSchema.optional(),
  active: z.boolean().optional(),
});

function toApiBot(b: {
  id: string;
  name: string;
  trigger: unknown;
  active: boolean;
  runs: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: b.id,
    name: b.name,
    trigger: parseBotTrigger(b.trigger),
    active: b.active,
    runs: b.runs,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  };
}

export async function botRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", async (request, reply) => {
    await requireAuth(request, reply);
    await resolveWorkspace(request, reply);
  });

  fastify.get("/", async (request) => {
    const rows = await prisma.bot.findMany({
      where: { workspaceId: request.workspaceId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toApiBot);
  });

  fastify.post(
    "/",
    { preHandler: requirePermission("settings.manage") },
    async (request, reply) => {
      const input = createSchema.parse(request.body);
      if (input.trigger.type === "keyword" && !input.trigger.keywords?.length) {
        throw badRequest("keywords_required", "Keyword trigger needs at least one keyword");
      }
      const bot = await prisma.bot.create({
        data: {
          workspaceId: request.workspaceId,
          name: input.name,
          trigger: input.trigger,
          ...(input.active !== undefined ? { active: input.active } : {}),
        },
      });
      return reply.status(201).send(toApiBot(bot));
    },
  );

  fastify.patch(
    "/:id",
    { preHandler: requirePermission("settings.manage") },
    async (request) => {
      const { id } = request.params as { id: string };
      const input = updateSchema.parse(request.body);
      const existing = await prisma.bot.findFirst({
        where: { id, workspaceId: request.workspaceId },
      });
      if (!existing) throw notFound("Bot not found");
      if (input.trigger?.type === "keyword" && !input.trigger.keywords?.length) {
        throw badRequest("keywords_required", "Keyword trigger needs at least one keyword");
      }
      const bot = await prisma.bot.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.trigger !== undefined ? { trigger: input.trigger } : {}),
          ...(input.active !== undefined ? { active: input.active } : {}),
        },
      });
      return toApiBot(bot);
    },
  );

  fastify.delete(
    "/:id",
    { preHandler: requirePermission("settings.manage") },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const existing = await prisma.bot.findFirst({
        where: { id, workspaceId: request.workspaceId },
        select: { id: true },
      });
      if (!existing) throw notFound("Bot not found");
      await prisma.bot.delete({ where: { id } });
      await audit(prisma, {
        workspaceId: request.workspaceId,
        userId: request.userId,
        action: "bot.deleted",
        targetType: "bot",
        targetId: id,
        ip: request.ip,
      });
      return reply.status(204).send();
    },
  );
}
