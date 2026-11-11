import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { audit } from "../lib/audit.js";
import { badRequest, notFound } from "../lib/errors.js";
import {
  audienceLabel,
  parseAudience,
  snapshotRecipients,
  skipOutstandingRecipients,
  recountBroadcast,
} from "../lib/broadcasts.js";
import {
  enqueueBroadcastDispatch,
  removeBroadcastDispatch,
} from "../lib/jobs.js";
import {
  requireAuth,
  resolveWorkspace,
  requirePermission,
} from "../plugins/auth.js";

/* ---------- API shape (mirrors frontend Broadcast contract) ---------- */

type BroadcastWithTemplate = Prisma.BroadcastGetPayload<{
  include: { template: { select: { name: true } } };
}>;

async function toApiBroadcast(b: BroadcastWithTemplate) {
  const recipients = await prisma.broadcastRecipient.groupBy({
    by: ["status"],
    where: { broadcastId: b.id },
    _count: { _all: true },
  });
  const count = (s: string) => recipients.find((r) => r.status === s)?._count._all ?? 0;
  return {
    id: b.id,
    name: b.name,
    templateId: b.templateId,
    templateName: b.template.name,
    audience: b.audience,
    audienceLabel: await audienceLabel(b.workspaceId, b.audience),
    status: b.status,
    sent: b.sent,
    delivered: b.delivered,
    read: b.read,
    failed: count("failed"),
    skipped: count("skipped"),
    total: recipients.reduce((n, r) => n + r._count._all, 0),
    scheduledAt: b.scheduledAt?.toISOString(),
    campaignId: b.campaignId ?? undefined,
    channelAccountId: b.channelAccountId ?? undefined,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  };
}

/* ---------- input schemas ---------- */

const broadcastInput = z.object({
  name: z.string().trim().min(1).max(160),
  templateId: z.string().min(1),
  audience: z.string().trim().min(1).max(300).default("all"),
  channelAccountId: z.string().optional(),
  campaignId: z.string().optional(),
  scheduledAt: z.string().datetime({ offset: true }).optional(),
});

// No defaults — partial() would inject audience:"all" into every PATCH.
const updateSchema = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  audience: z.string().trim().min(1).max(300).optional(),
  channelAccountId: z.string().optional(),
  campaignId: z.string().optional(),
  scheduledAt: z.string().datetime({ offset: true }).nullable().optional(),
});

const listQuerySchema = z.object({
  status: z
    .enum(["draft", "scheduled", "sending", "sent", "cancelled", "failed"])
    .optional(),
  campaignId: z.string().optional(),
  search: z.string().trim().max(160).optional(),
});

const recipientsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
  status: z
    .enum(["pending", "queued", "sent", "delivered", "read", "failed", "skipped"])
    .optional(),
});

const broadcastInclude = {
  template: { select: { name: true } },
} satisfies Prisma.BroadcastInclude;

/* ---------- routes ---------- */

export async function broadcastRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", async (request, reply) => {
    await requireAuth(request, reply);
    await resolveWorkspace(request, reply);
  });

  // GET /broadcasts — list with delivery counters
  fastify.get("/", async (request) => {
    const q = listQuerySchema.parse(request.query);
    const where: Prisma.BroadcastWhereInput = { workspaceId: request.workspaceId };
    if (q.status) where.status = q.status;
    if (q.campaignId) where.campaignId = q.campaignId;
    if (q.search) where.name = { contains: q.search, mode: "insensitive" };
    const rows = await prisma.broadcast.findMany({
      where,
      include: broadcastInclude,
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return Promise.all(rows.map(toApiBroadcast));
  });

  // POST /broadcasts — create; snapshots audience; sends now or schedules
  fastify.post(
    "/",
    { preHandler: requirePermission("broadcast.create") },
    async (request, reply) => {
      const input = broadcastInput.parse(request.body);
      const ws = request.workspaceId;

      const template = await prisma.template.findFirst({
        where: { id: input.templateId, workspaceId: ws },
      });
      if (!template) throw notFound("Template not found");
      if (template.status !== "approved") {
        throw badRequest("template_not_approved", "Broadcasts require an approved template");
      }

      const audience = await parseAudience(ws, input.audience);

      if (input.campaignId) {
        const campaign = await prisma.campaign.findFirst({
          where: { id: input.campaignId, workspaceId: ws },
          select: { id: true },
        });
        if (!campaign) throw notFound("Campaign not found");
      }
      if (input.channelAccountId) {
        const account = await prisma.channelAccount.findFirst({
          where: { id: input.channelAccountId, workspaceId: ws },
          select: { id: true },
        });
        if (!account) throw notFound("Channel account not found");
      }

      const scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null;
      if (scheduledAt && scheduledAt.getTime() <= Date.now()) {
        throw badRequest("invalid_schedule", "scheduledAt must be in the future");
      }

      const broadcast = await prisma.broadcast.create({
        data: {
          workspaceId: ws,
          name: input.name,
          templateId: template.id,
          audience: audience.canonical,
          status: scheduledAt ? "scheduled" : "draft",
          ...(scheduledAt ? { scheduledAt } : {}),
          ...(input.channelAccountId ? { channelAccountId: input.channelAccountId } : {}),
          ...(input.campaignId ? { campaignId: input.campaignId } : {}),
          createdById: request.userId,
        },
      });
      await snapshotRecipients(broadcast);

      if (!scheduledAt) {
        await enqueueBroadcastDispatch(broadcast.id, null);
      } else {
        await enqueueBroadcastDispatch(broadcast.id, scheduledAt);
      }

      const full = await prisma.broadcast.findUniqueOrThrow({
        where: { id: broadcast.id },
        include: broadcastInclude,
      });
      await audit(prisma, {
        workspaceId: ws,
        userId: request.userId,
        action: "broadcast.created",
        targetType: "broadcast",
        targetId: broadcast.id,
        meta: { audience: audience.canonical, scheduledAt: scheduledAt?.toISOString() },
        ip: request.ip,
      });
      return reply.status(201).send(await toApiBroadcast(full));
    },
  );

  // GET /broadcasts/:id
  fastify.get("/:id", async (request) => {
    const { id } = request.params as { id: string };
    const broadcast = await prisma.broadcast.findFirst({
      where: { id, workspaceId: request.workspaceId },
      include: broadcastInclude,
    });
    if (!broadcast) throw notFound("Broadcast not found");
    return toApiBroadcast(broadcast);
  });

  // GET /broadcasts/:id/recipients — per-recipient delivery log
  fastify.get("/:id/recipients", async (request) => {
    const { id } = request.params as { id: string };
    const q = recipientsQuerySchema.parse(request.query);
    const broadcast = await prisma.broadcast.findFirst({
      where: { id, workspaceId: request.workspaceId },
      select: { id: true },
    });
    if (!broadcast) throw notFound("Broadcast not found");

    const where: Prisma.BroadcastRecipientWhereInput = { broadcastId: id };
    if (q.status) where.status = q.status;
    const [total, rows] = await Promise.all([
      prisma.broadcastRecipient.count({ where }),
      prisma.broadcastRecipient.findMany({
        where,
        include: { contact: { select: { name: true, phone: true } } },
        orderBy: { createdAt: "asc" },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
    ]);
    return {
      items: rows.map((r) => ({
        id: r.id,
        contactId: r.contactId,
        contactName: r.contact.name ?? "",
        phone: r.contact.phone,
        status: r.status,
        error: r.error ?? undefined,
        sentAt: r.sentAt?.toISOString(),
        deliveredAt: r.deliveredAt?.toISOString(),
        readAt: r.readAt?.toISOString(),
        failedAt: r.failedAt?.toISOString(),
      })),
      total,
      page: q.page,
      pageSize: q.pageSize,
    };
  });

  // PATCH /broadcasts/:id — draft only: name, audience, schedule
  fastify.patch(
    "/:id",
    { preHandler: requirePermission("broadcast.create") },
    async (request) => {
      const { id } = request.params as { id: string };
      const input = updateSchema.parse(request.body);
      const existing = await prisma.broadcast.findFirst({
        where: { id, workspaceId: request.workspaceId },
      });
      if (!existing) throw notFound("Broadcast not found");
      if (existing.status !== "draft" && existing.status !== "scheduled") {
        throw badRequest("invalid_state", `Cannot edit a ${existing.status} broadcast`);
      }

      let audienceCanonical = existing.audience;
      if (input.audience !== undefined) {
        audienceCanonical = (await parseAudience(request.workspaceId, input.audience)).canonical;
      }
      const scheduledAt =
        input.scheduledAt === null
          ? null
          : input.scheduledAt !== undefined
            ? new Date(input.scheduledAt)
            : existing.scheduledAt;
      if (scheduledAt && scheduledAt.getTime() <= Date.now()) {
        throw badRequest("invalid_schedule", "scheduledAt must be in the future");
      }

      const broadcast = await prisma.broadcast.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.audience !== undefined ? { audience: audienceCanonical } : {}),
          scheduledAt,
          status: scheduledAt ? "scheduled" : "draft",
          ...(input.campaignId !== undefined ? { campaignId: input.campaignId || null } : {}),
          ...(input.channelAccountId !== undefined
            ? { channelAccountId: input.channelAccountId || null }
            : {}),
        },
      });

      // Audience changed → rebuild the recipient snapshot.
      if (input.audience !== undefined) {
        await prisma.broadcastRecipient.deleteMany({ where: { broadcastId: id } });
        await snapshotRecipients(broadcast);
      }
      // Rescheduled → replace the pending delayed dispatch job.
      if (scheduledAt && existing.status === "scheduled") {
        await removeBroadcastDispatch(id);
        await enqueueBroadcastDispatch(id, scheduledAt);
      }
      return toApiBroadcast(
        await prisma.broadcast.findUniqueOrThrow({
          where: { id },
          include: broadcastInclude,
        }),
      );
    },
  );

  // POST /broadcasts/:id/send — send a draft (or send a scheduled one now)
  fastify.post(
    "/:id/send",
    { preHandler: requirePermission("broadcast.create") },
    async (request) => {
      const { id } = request.params as { id: string };
      const existing = await prisma.broadcast.findFirst({
        where: { id, workspaceId: request.workspaceId },
      });
      if (!existing) throw notFound("Broadcast not found");
      if (existing.status !== "draft" && existing.status !== "scheduled") {
        throw badRequest("invalid_state", `Cannot send a ${existing.status} broadcast`);
      }
      await removeBroadcastDispatch(id);
      await enqueueBroadcastDispatch(id, null);
      await audit(prisma, {
        workspaceId: request.workspaceId,
        userId: request.userId,
        action: "broadcast.sent",
        targetType: "broadcast",
        targetId: id,
        ip: request.ip,
      });
      return toApiBroadcast(
        await prisma.broadcast.findUniqueOrThrow({
          where: { id },
          include: broadcastInclude,
        }),
      );
    },
  );

  // POST /broadcasts/:id/cancel — cancel scheduled/sending/draft
  fastify.post(
    "/:id/cancel",
    { preHandler: requirePermission("broadcast.create") },
    async (request) => {
      const { id } = request.params as { id: string };
      const existing = await prisma.broadcast.findFirst({
        where: { id, workspaceId: request.workspaceId },
      });
      if (!existing) throw notFound("Broadcast not found");
      if (["sent", "cancelled", "failed"].includes(existing.status)) {
        throw badRequest("invalid_state", `Cannot cancel a ${existing.status} broadcast`);
      }
      await removeBroadcastDispatch(id);
      await skipOutstandingRecipients(id);
      await prisma.broadcast.update({ where: { id }, data: { status: "cancelled" } });
      await recountBroadcast(id);
      await audit(prisma, {
        workspaceId: request.workspaceId,
        userId: request.userId,
        action: "broadcast.cancelled",
        targetType: "broadcast",
        targetId: id,
        ip: request.ip,
      });
      return toApiBroadcast(
        await prisma.broadcast.findUniqueOrThrow({
          where: { id },
          include: broadcastInclude,
        }),
      );
    },
  );

  // DELETE /broadcasts/:id — draft/scheduled/cancelled only
  fastify.delete(
    "/:id",
    { preHandler: requirePermission("broadcast.create") },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const existing = await prisma.broadcast.findFirst({
        where: { id, workspaceId: request.workspaceId },
      });
      if (!existing) throw notFound("Broadcast not found");
      if (!["draft", "scheduled", "cancelled"].includes(existing.status)) {
        throw badRequest("invalid_state", `Cannot delete a ${existing.status} broadcast`);
      }
      await removeBroadcastDispatch(id);
      await prisma.broadcast.delete({ where: { id } });
      await audit(prisma, {
        workspaceId: request.workspaceId,
        userId: request.userId,
        action: "broadcast.deleted",
        targetType: "broadcast",
        targetId: id,
        ip: request.ip,
      });
      return reply.status(204).send();
    },
  );
}
