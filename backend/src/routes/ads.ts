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

const adSchema = z.object({
  name: z.string().trim().min(1).max(120),
  // International number; stored as digits only.
  phone: z
    .string()
    .trim()
    .min(6)
    .max(20)
    .transform((v) => v.replace(/[^\d]/g, ""))
    .refine((v) => v.length >= 6, "Invalid phone number"),
  message: z.string().trim().max(1000).default(""),
  active: z.boolean().optional(),
});

const updateSchema = adSchema.partial();

export function waMeLink(phone: string, message: string): string {
  const base = `https://wa.me/${phone}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

function toApiAd(a: {
  id: string;
  name: string;
  phone: string;
  message: string;
  active: boolean;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: a.id,
    name: a.name,
    phone: a.phone,
    message: a.message,
    active: a.active,
    clicks: a.clicks,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    waLink: waMeLink(a.phone, a.message),
  };
}

export async function adRoutes(fastify: FastifyInstance) {
  // Public click tracker — no auth; increments counter and redirects to wa.me.
  fastify.get("/click/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const ad = await prisma.ad.findUnique({ where: { id }, select: { phone: true, message: true } });
    if (!ad) throw notFound("Ad not found");
    await prisma.ad.update({ where: { id }, data: { clicks: { increment: 1 } } });
    return reply.redirect(waMeLink(ad.phone, ad.message), 302);
  });

  fastify.addHook("preHandler", async (request, reply) => {
    await requireAuth(request, reply);
    await resolveWorkspace(request, reply);
  });

  fastify.get("/", async (request) => {
    const rows = await prisma.ad.findMany({
      where: { workspaceId: request.workspaceId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toApiAd);
  });

  fastify.post(
    "/",
    { preHandler: requirePermission("settings.manage") },
    async (request, reply) => {
      const input = adSchema.parse(request.body);
      const ad = await prisma.ad.create({
        data: {
          workspaceId: request.workspaceId,
          name: input.name,
          phone: input.phone,
          message: input.message,
          ...(input.active !== undefined ? { active: input.active } : {}),
        },
      });
      await audit(prisma, {
        workspaceId: request.workspaceId,
        userId: request.userId,
        action: "ad.created",
        targetType: "ad",
        targetId: ad.id,
        ip: request.ip,
      });
      return reply.status(201).send(toApiAd(ad));
    },
  );

  fastify.patch(
    "/:id",
    { preHandler: requirePermission("settings.manage") },
    async (request) => {
      const { id } = request.params as { id: string };
      const input = updateSchema.parse(request.body);
      const existing = await prisma.ad.findFirst({
        where: { id, workspaceId: request.workspaceId },
      });
      if (!existing) throw notFound("Ad not found");
      const ad = await prisma.ad.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.phone !== undefined ? { phone: input.phone } : {}),
          ...(input.message !== undefined ? { message: input.message } : {}),
          ...(input.active !== undefined ? { active: input.active } : {}),
        },
      });
      return toApiAd(ad);
    },
  );

  fastify.delete(
    "/:id",
    { preHandler: requirePermission("settings.manage") },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const existing = await prisma.ad.findFirst({
        where: { id, workspaceId: request.workspaceId },
        select: { id: true },
      });
      if (!existing) throw notFound("Ad not found");
      await prisma.ad.delete({ where: { id } });
      return reply.status(204).send();
    },
  );
}
