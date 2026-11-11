import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { audit } from "../lib/audit.js";
import { badRequest, notFound } from "../lib/errors.js";
import {
  requireAuth,
  resolveWorkspace,
  requirePermission,
} from "../plugins/auth.js";

const dayHoursSchema = z.object({
  day: z.number().int().min(0).max(6),
  open: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  close: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
});

const businessHoursSchema = z.object({
  enabled: z.boolean(),
  timezone: z.string().trim().min(1).max(64).default("UTC"),
  hours: z.array(dayHoursSchema).max(7).default([]),
});

const TRIGGERS = ["first_message", "keyword", "outside_hours"] as const;

const autoReplySchema = z.object({
  name: z.string().trim().max(120).default(""),
  trigger: z.enum(TRIGGERS),
  keywords: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
  response: z.string().trim().min(1).max(2000),
  active: z.boolean().optional(),
});

const autoReplyUpdateSchema = autoReplySchema.partial();

function toApiHours(h: {
  enabled: boolean;
  timezone: string;
  hours: unknown;
}) {
  return { enabled: h.enabled, timezone: h.timezone, hours: h.hours };
}

function toApiAutoReply(r: {
  id: string;
  name: string;
  trigger: string;
  keywords: string[];
  response: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: r.id,
    name: r.name,
    trigger: r.trigger,
    keywords: r.keywords,
    response: r.response,
    active: r.active,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function automationRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", async (request, reply) => {
    await requireAuth(request, reply);
    await resolveWorkspace(request, reply);
  });

  /* ---------- business hours ---------- */

  fastify.get("/business-hours", async (request) => {
    const h = await prisma.businessHours.findUnique({
      where: { workspaceId: request.workspaceId },
    });
    return h
      ? toApiHours(h)
      : { enabled: true, timezone: "UTC", hours: [] };
  });

  fastify.put(
    "/business-hours",
    { preHandler: requirePermission("settings.manage") },
    async (request) => {
      const input = businessHoursSchema.parse(request.body);
      // Validate timezone is a real IANA zone.
      try {
        new Intl.DateTimeFormat("en-US", { timeZone: input.timezone });
      } catch {
        throw badRequest("invalid_timezone", "Unknown timezone");
      }
      const data = {
        enabled: input.enabled,
        timezone: input.timezone,
        hours: input.hours,
      };
      const h = await prisma.businessHours.upsert({
        where: { workspaceId: request.workspaceId },
        create: { workspaceId: request.workspaceId, ...data },
        update: data,
      });
      await audit(prisma, {
        workspaceId: request.workspaceId,
        userId: request.userId,
        action: "business_hours.updated",
        targetType: "business_hours",
        targetId: h.id,
        ip: request.ip,
      });
      return toApiHours(h);
    },
  );

  /* ---------- auto-replies ---------- */

  fastify.get("/auto-replies", async (request) => {
    const rows = await prisma.autoReply.findMany({
      where: { workspaceId: request.workspaceId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toApiAutoReply);
  });

  fastify.post(
    "/auto-replies",
    { preHandler: requirePermission("settings.manage") },
    async (request, reply) => {
      const input = autoReplySchema.parse(request.body);
      if (input.trigger === "keyword" && input.keywords.length === 0) {
        throw badRequest("keywords_required", "Keyword trigger needs at least one keyword");
      }
      const rule = await prisma.autoReply.create({
        data: {
          workspaceId: request.workspaceId,
          name: input.name,
          trigger: input.trigger,
          keywords: input.keywords,
          response: input.response,
          ...(input.active !== undefined ? { active: input.active } : {}),
        },
      });
      return reply.status(201).send(toApiAutoReply(rule));
    },
  );

  fastify.patch(
    "/auto-replies/:id",
    { preHandler: requirePermission("settings.manage") },
    async (request) => {
      const { id } = request.params as { id: string };
      const input = autoReplyUpdateSchema.parse(request.body);
      const existing = await prisma.autoReply.findFirst({
        where: { id, workspaceId: request.workspaceId },
      });
      if (!existing) throw notFound("Auto-reply not found");
      const trigger = input.trigger ?? existing.trigger;
      const keywords = input.keywords ?? existing.keywords;
      if (trigger === "keyword" && keywords.length === 0) {
        throw badRequest("keywords_required", "Keyword trigger needs at least one keyword");
      }
      const rule = await prisma.autoReply.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.trigger !== undefined ? { trigger: input.trigger } : {}),
          ...(input.keywords !== undefined ? { keywords: input.keywords } : {}),
          ...(input.response !== undefined ? { response: input.response } : {}),
          ...(input.active !== undefined ? { active: input.active } : {}),
        },
      });
      return toApiAutoReply(rule);
    },
  );

  fastify.delete(
    "/auto-replies/:id",
    { preHandler: requirePermission("settings.manage") },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const existing = await prisma.autoReply.findFirst({
        where: { id, workspaceId: request.workspaceId },
        select: { id: true },
      });
      if (!existing) throw notFound("Auto-reply not found");
      await prisma.autoReply.delete({ where: { id } });
      return reply.status(204).send();
    },
  );
}
