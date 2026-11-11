import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { audit } from "../lib/audit.js";
import { notFound } from "../lib/errors.js";
import {
  WEBHOOK_EVENTS,
  encryptSecret,
  newWebhookSecret,
} from "../lib/webhook-out.js";
import { enqueueWebhookDelivery } from "../lib/jobs.js";
import {
  requireAuth,
  resolveWorkspace,
  requirePermission,
} from "../plugins/auth.js";

const eventsSchema = z
  .array(z.string().trim().min(1).max(60))
  .min(1)
  .max(WEBHOOK_EVENTS.length + 4);

const createSchema = z.object({
  url: z.string().url().max(500).refine((u) => u.startsWith("https://"), {
    message: "Webhook URL must use https",
  }),
  events: eventsSchema,
  active: z.boolean().optional(),
});

const updateSchema = z.object({
  url: createSchema.shape.url.optional(),
  events: eventsSchema.optional(),
  active: z.boolean().optional(),
});

function toApiHook(h: {
  id: string;
  url: string;
  events: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  secretEncrypted: string | null;
  _count?: { deliveries: number };
}) {
  return {
    id: h.id,
    url: h.url,
    events: h.events,
    active: h.active,
    hasSecret: !!h.secretEncrypted,
    deliveryCount: h._count?.deliveries ?? 0,
    createdAt: h.createdAt.toISOString(),
    updatedAt: h.updatedAt.toISOString(),
  };
}

export async function webhookEndpointRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", async (request, reply) => {
    await requireAuth(request, reply);
    await resolveWorkspace(request, reply);
  });

  fastify.get("/", async (request) => {
    const rows = await prisma.webhook.findMany({
      where: { workspaceId: request.workspaceId, channelAccountId: null },
      include: { _count: { select: { deliveries: true } } },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toApiHook);
  });

  fastify.post(
    "/",
    { preHandler: requirePermission("settings.manage") },
    async (request, reply) => {
      const input = createSchema.parse(request.body);
      const secret = newWebhookSecret();
      const hook = await prisma.webhook.create({
        data: {
          workspaceId: request.workspaceId,
          url: input.url,
          events: input.events.join(","),
          secretEncrypted: encryptSecret(secret),
          ...(input.active !== undefined ? { active: input.active } : {}),
        },
        include: { _count: { select: { deliveries: true } } },
      });
      await audit(prisma, {
        workspaceId: request.workspaceId,
        userId: request.userId,
        action: "webhook_endpoint.created",
        targetType: "webhook",
        targetId: hook.id,
        ip: request.ip,
      });
      // Secret is returned exactly once — only the encrypted form is stored.
      return reply.status(201).send({ ...toApiHook(hook), secret });
    },
  );

  fastify.patch(
    "/:id",
    { preHandler: requirePermission("settings.manage") },
    async (request) => {
      const { id } = request.params as { id: string };
      const input = updateSchema.parse(request.body);
      const existing = await prisma.webhook.findFirst({
        where: { id, workspaceId: request.workspaceId, channelAccountId: null },
      });
      if (!existing) throw notFound("Webhook not found");
      const hook = await prisma.webhook.update({
        where: { id },
        data: {
          ...(input.url !== undefined ? { url: input.url } : {}),
          ...(input.events !== undefined ? { events: input.events.join(",") } : {}),
          ...(input.active !== undefined ? { active: input.active } : {}),
        },
        include: { _count: { select: { deliveries: true } } },
      });
      return toApiHook(hook);
    },
  );

  fastify.delete(
    "/:id",
    { preHandler: requirePermission("settings.manage") },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const existing = await prisma.webhook.findFirst({
        where: { id, workspaceId: request.workspaceId, channelAccountId: null },
        select: { id: true },
      });
      if (!existing) throw notFound("Webhook not found");
      await prisma.webhook.delete({ where: { id } });
      return reply.status(204).send();
    },
  );

  // Rotate the signing secret — old signatures stop validating immediately.
  fastify.post(
    "/:id/rotate-secret",
    { preHandler: requirePermission("settings.manage") },
    async (request) => {
      const { id } = request.params as { id: string };
      const existing = await prisma.webhook.findFirst({
        where: { id, workspaceId: request.workspaceId, channelAccountId: null },
      });
      if (!existing) throw notFound("Webhook not found");
      const secret = newWebhookSecret();
      await prisma.webhook.update({
        where: { id },
        data: { secretEncrypted: encryptSecret(secret) },
      });
      return { secret };
    },
  );

  // Send a signed test event through the normal delivery pipeline.
  fastify.post(
    "/:id/test",
    { preHandler: requirePermission("settings.manage") },
    async (request) => {
      const { id } = request.params as { id: string };
      const hook = await prisma.webhook.findFirst({
        where: { id, workspaceId: request.workspaceId, channelAccountId: null },
      });
      if (!hook) throw notFound("Webhook not found");
      const delivery = await prisma.webhookDelivery.create({
        data: {
          webhookId: hook.id,
          event: "test",
          payload: {
            event: "test",
            data: { message: "Test webhook from Konvo" },
            sentAt: new Date().toISOString(),
          },
        },
      });
      await enqueueWebhookDelivery(delivery.id);
      return { deliveryId: delivery.id };
    },
  );

  // Recent deliveries for the UI's status view.
  fastify.get("/:id/deliveries", async (request) => {
    const { id } = request.params as { id: string };
    const hook = await prisma.webhook.findFirst({
      where: { id, workspaceId: request.workspaceId, channelAccountId: null },
      select: { id: true },
    });
    if (!hook) throw notFound("Webhook not found");
    const rows = await prisma.webhookDelivery.findMany({
      where: { webhookId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return rows.map((d) => ({
      id: d.id,
      event: d.event,
      status: d.status ?? null,
      attempts: d.attempts,
      deliveredAt: d.deliveredAt?.toISOString() ?? null,
      lastError: d.lastError ?? null,
      createdAt: d.createdAt.toISOString(),
    }));
  });
}
