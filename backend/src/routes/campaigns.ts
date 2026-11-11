import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { audit } from "../lib/audit.js";
import { notFound } from "../lib/errors.js";
import {
  requireAuth,
  resolveWorkspace,
  requirePermission,
} from "../plugins/auth.js";

/* ---------- API shape ---------- */

type CampaignWithCount = Prisma.CampaignGetPayload<{
  include: { _count: { select: { broadcasts: true } } };
}>;

async function toApiCampaign(c: CampaignWithCount) {
  const stats = await prisma.broadcast.aggregate({
    where: { campaignId: c.id },
    _sum: { sent: true, delivered: true, read: true },
  });
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    status: c.status,
    broadcastCount: c._count.broadcasts,
    sent: stats._sum.sent ?? 0,
    delivered: stats._sum.delivered ?? 0,
    read: stats._sum.read ?? 0,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

/* ---------- input schemas ---------- */

const campaignInput = z.object({
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).default(""),
});

// description has no default here — partial() would wipe it on every PATCH.
const updateSchema = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  description: z.string().trim().max(2000).optional(),
  status: z.enum(["draft", "active", "paused", "completed", "cancelled"]).optional(),
});

const listQuerySchema = z.object({
  status: z.enum(["draft", "active", "paused", "completed", "cancelled"]).optional(),
  search: z.string().trim().max(160).optional(),
});

const campaignInclude = {
  _count: { select: { broadcasts: true } },
} satisfies Prisma.CampaignInclude;

/* ---------- routes ---------- */

export async function campaignRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", async (request, reply) => {
    await requireAuth(request, reply);
    await resolveWorkspace(request, reply);
  });

  // GET /campaigns
  fastify.get("/", async (request) => {
    const q = listQuerySchema.parse(request.query);
    const where: Prisma.CampaignWhereInput = { workspaceId: request.workspaceId };
    if (q.status) where.status = q.status;
    if (q.search) where.name = { contains: q.search, mode: "insensitive" };
    const rows = await prisma.campaign.findMany({
      where,
      include: campaignInclude,
      orderBy: { updatedAt: "desc" },
      take: 500,
    });
    return Promise.all(rows.map(toApiCampaign));
  });

  // POST /campaigns
  fastify.post(
    "/",
    { preHandler: requirePermission("broadcast.create") },
    async (request, reply) => {
      const input = campaignInput.parse(request.body);
      const campaign = await prisma.campaign.create({
        data: {
          workspaceId: request.workspaceId,
          name: input.name,
          description: input.description,
          createdById: request.userId,
        },
        include: campaignInclude,
      });
      await audit(prisma, {
        workspaceId: request.workspaceId,
        userId: request.userId,
        action: "campaign.created",
        targetType: "campaign",
        targetId: campaign.id,
        ip: request.ip,
      });
      return reply.status(201).send(await toApiCampaign(campaign));
    },
  );

  // GET /campaigns/:id — campaign + its broadcasts
  fastify.get("/:id", async (request) => {
    const { id } = request.params as { id: string };
    const campaign = await prisma.campaign.findFirst({
      where: { id, workspaceId: request.workspaceId },
      include: {
        ...campaignInclude,
        broadcasts: {
          include: { template: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!campaign) throw notFound("Campaign not found");
    const { broadcasts, ...rest } = campaign;
    return {
      ...(await toApiCampaign(rest)),
      broadcasts: await Promise.all(
        broadcasts.map(async (b) => ({
          id: b.id,
          name: b.name,
          templateId: b.templateId,
          templateName: b.template.name,
          audience: b.audience,
          status: b.status,
          sent: b.sent,
          delivered: b.delivered,
          read: b.read,
          scheduledAt: b.scheduledAt?.toISOString(),
          createdAt: b.createdAt.toISOString(),
        })),
      ),
    };
  });

  // PATCH /campaigns/:id — rename, describe, or change lifecycle status
  fastify.patch(
    "/:id",
    { preHandler: requirePermission("broadcast.create") },
    async (request) => {
      const { id } = request.params as { id: string };
      const input = updateSchema.parse(request.body);
      const existing = await prisma.campaign.findFirst({
        where: { id, workspaceId: request.workspaceId },
      });
      if (!existing) throw notFound("Campaign not found");
      const campaign = await prisma.campaign.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
        },
        include: campaignInclude,
      });
      return toApiCampaign(campaign);
    },
  );

  // DELETE /campaigns/:id — broadcasts are unlinked (campaignId → null)
  fastify.delete(
    "/:id",
    { preHandler: requirePermission("broadcast.create") },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const existing = await prisma.campaign.findFirst({
        where: { id, workspaceId: request.workspaceId },
      });
      if (!existing) throw notFound("Campaign not found");
      await prisma.campaign.delete({ where: { id } });
      await audit(prisma, {
        workspaceId: request.workspaceId,
        userId: request.userId,
        action: "campaign.deleted",
        targetType: "campaign",
        targetId: id,
        ip: request.ip,
      });
      return reply.status(204).send();
    },
  );
}
