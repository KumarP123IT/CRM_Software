import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { ChannelAccount, ChannelAccountType } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { audit } from "../lib/audit.js";
import { encryptSecret } from "../lib/crypto.js";
import { notFound } from "../lib/errors.js";
import { getAdapter, supportedChannelTypes } from "../channels/index.js";
import { accountCredentials } from "../lib/inbox.js";
import {
  requireAuth,
  resolveWorkspace,
  requirePermission,
} from "../plugins/auth.js";

const CHANNEL_TYPES = ["whatsapp", "instagram", "messenger", "telegram", "web", "sms", "email"] as const;

const connectSchema = z.object({
  type: z.enum(CHANNEL_TYPES),
  // telegram
  botToken: z.string().trim().min(1).max(200).optional(),
  // whatsapp embedded signup
  code: z.string().trim().min(1).max(4000).optional(),
  phoneNumberId: z.string().trim().min(1).max(100).optional(),
  businessAccountId: z.string().trim().max(100).optional(),
  // web widget / shared
  name: z.string().trim().min(1).max(120).optional(),
  domain: z.string().trim().max(255).optional(),
});

const updateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  autoAssign: z.boolean().optional(),
});

function toApiInbox(account: ChannelAccount) {
  const creds = accountCredentials(account);
  const webhookVerified =
    account.type === "web"
      ? true
      : account.type === "telegram"
        ? typeof creds["webhookSecret"] === "string"
        : account.type === "whatsapp"
          ? typeof creds["verifyToken"] === "string"
          : false;
  return {
    id: account.id,
    name: account.displayName ?? account.type,
    type: account.type,
    status: account.status,
    phoneNumber: account.phoneNumber ?? "",
    qualityRating: account.qualityRating ?? undefined,
    messagingTier: account.messagingTier ?? undefined,
    webhookVerified,
    autoAssign: account.autoAssign,
    createdAt: account.createdAt.toISOString(),
  };
}

export async function channelRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", async (request, reply) => {
    await requireAuth(request, reply);
    await resolveWorkspace(request, reply);
  });

  // GET /channels — supported types + connected accounts
  fastify.get("/", async (request) => {
    const accounts = await prisma.channelAccount.findMany({
      where: { workspaceId: request.workspaceId },
      orderBy: { createdAt: "asc" },
    });
    return {
      supported: supportedChannelTypes(),
      items: accounts.map(toApiInbox),
    };
  });

  // POST /channels/connect — validate credentials via the channel adapter and store them encrypted.
  fastify.post(
    "/connect",
    { preHandler: requirePermission("settings.manage") },
    async (request, reply) => {
      const input = connectSchema.parse(request.body);
      const adapter = getAdapter(input.type as ChannelAccountType);
      const result = await adapter.connect(input as unknown as Record<string, unknown>);

      const account = await prisma.channelAccount.create({
        data: {
          workspaceId: request.workspaceId,
          type: input.type,
          status: result.status ?? "connected",
          encryptedCredentials: encryptSecret(JSON.stringify(result.credentials)),
          ...(result.phoneNumber ? { phoneNumber: result.phoneNumber } : {}),
          ...(result.displayName ? { displayName: result.displayName } : {}),
          ...(result.qualityRating ? { qualityRating: result.qualityRating } : {}),
          ...(result.messagingTier ? { messagingTier: result.messagingTier } : {}),
        },
      });

      try {
        await adapter.afterConnect?.(account, result.credentials);
      } catch (err) {
        request.log.warn({ err }, "channel afterConnect failed");
      }

      await audit(prisma, {
        workspaceId: request.workspaceId,
        userId: request.userId,
        action: "channel.connected",
        targetType: "channel_account",
        targetId: account.id,
        meta: { type: account.type },
        ip: request.ip,
      });
      return reply.status(201).send(toApiInbox(account));
    },
  );

  // GET /channels/:id — detail incl. webhook setup info for admins.
  fastify.get("/:id", async (request) => {
    const { id } = request.params as { id: string };
    const account = await prisma.channelAccount.findFirst({
      where: { id, workspaceId: request.workspaceId },
    });
    if (!account) throw notFound("Channel not found");
    const creds = accountCredentials(account);
    return {
      ...toApiInbox(account),
      webhookPath: `/api/webhooks/${account.type}/${account.id}`,
      ...(typeof creds["verifyToken"] === "string" ? { verifyToken: creds["verifyToken"] } : {}),
      ...(typeof creds["widgetToken"] === "string" ? { widgetToken: creds["widgetToken"] } : {}),
      ...(typeof creds["webhookSecret"] === "string" ? { webhookSecret: creds["webhookSecret"] } : {}),
    };
  });

  // PATCH /channels/:id — rename / auto-assign toggle.
  fastify.patch("/:id", async (request) => {
    const { id } = request.params as { id: string };
    const input = updateSchema.parse(request.body);
    const existing = await prisma.channelAccount.findFirst({
      where: { id, workspaceId: request.workspaceId },
    });
    if (!existing) throw notFound("Channel not found");
    const account = await prisma.channelAccount.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { displayName: input.name } : {}),
        ...(input.autoAssign !== undefined ? { autoAssign: input.autoAssign } : {}),
      },
    });
    return toApiInbox(account);
  });

  // DELETE /channels/:id — disconnect (keeps history, stops new inbound).
  fastify.delete(
    "/:id",
    { preHandler: requirePermission("settings.manage") },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const existing = await prisma.channelAccount.findFirst({
        where: { id, workspaceId: request.workspaceId },
      });
      if (!existing) throw notFound("Channel not found");
      await prisma.channelAccount.update({
        where: { id },
        data: { status: "disconnected" },
      });
      await audit(prisma, {
        workspaceId: request.workspaceId,
        userId: request.userId,
        action: "channel.disconnected",
        targetType: "channel_account",
        targetId: id,
        ip: request.ip,
      });
      return reply.status(204).send();
    },
  );

  // POST /channels/:id/test — provider health check.
  fastify.post("/:id/test", async (request) => {
    const { id } = request.params as { id: string };
    const account = await prisma.channelAccount.findFirst({
      where: { id, workspaceId: request.workspaceId },
    });
    if (!account) throw notFound("Channel not found");
    const adapter = getAdapter(account.type);
    if (!adapter.healthCheck) return { ok: true };
    return adapter.healthCheck(account, accountCredentials(account));
  });
}
