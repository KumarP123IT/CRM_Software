import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import type { ChannelAccountType } from "@prisma/client";
import { config } from "../config.js";
import { prisma } from "../lib/prisma.js";
import { badRequest, notFound, unauthorized } from "../lib/errors.js";
import { getAdapter } from "../channels/index.js";
import { accountCredentials, toApiMessage } from "../lib/inbox.js";
import { enqueueChannelInbound } from "../lib/jobs.js";

const CHANNEL_TYPES = ["whatsapp", "instagram", "messenger", "telegram", "web", "sms", "email"] as const;

/**
 * Rate limits for the public webhook routes (they replace the global 300/min).
 * Provider callbacks (Meta, Telegram) arrive in bursts from a few IPs, so they
 * get a high per-IP ceiling — authenticity is enforced by signature/secret
 * checks in the handlers. The web widget is keyed per visitor+IP because its
 * visitorId is client-supplied (until signed visitor tokens land).
 */
const PROVIDER_POST_MAX = () => Math.round(1000 * config.RATE_LIMIT_SCALE);
const WIDGET_MAX = () => Math.round(60 * config.RATE_LIMIT_SCALE);
const VERIFY_MAX = () => Math.round(30 * config.RATE_LIMIT_SCALE);

function visitorKey(req: FastifyRequest, accountId: string, visitorId: unknown): string {
  const vid = typeof visitorId === "string" && visitorId ? visitorId.slice(0, 100) : "anon";
  return `${req.ip}:${accountId}:${vid}`;
}

/**
 * Public provider webhooks — no session auth. Authenticity is enforced per
 * adapter (Telegram secret-token header, WhatsApp HMAC signature, widget token).
 * Inbound payloads are normalized, deduped by (channelAccountId,
 * providerMessageId) downstream, and processed via the channel-inbound queue.
 */
export async function webhookRoutes(fastify: FastifyInstance) {
  // Capture the raw body so HMAC signature verification (WhatsApp) works.
  fastify.addContentTypeParser(
    "application/json",
    { parseAs: "buffer" },
    (request: FastifyRequest, body: Buffer, done) => {
      (request as FastifyRequest & { rawBody?: Buffer }).rawBody = body;
      try {
        done(null, body.length ? JSON.parse(body.toString("utf8")) : {});
      } catch (err) {
        done(err as Error);
      }
    },
  );

  // GET /webhooks/whatsapp/:accountId — Meta webhook verification handshake.
  // Called once per channel setup; a tight per-IP limit is plenty.
  fastify.get(
    "/whatsapp/:accountId",
    { config: { rateLimit: { max: VERIFY_MAX(), timeWindow: "1 minute" } } },
    async (request, reply) => {
    const { accountId } = request.params as { accountId: string };
    const q = z
      .object({
        "hub.mode": z.string().optional(),
        "hub.verify_token": z.string().optional(),
        "hub.challenge": z.string().optional(),
      })
      .parse(request.query);
    const account = await prisma.channelAccount.findFirst({
      where: { id: accountId, type: "whatsapp" },
    });
    if (!account) throw notFound("Channel not found");
    const creds = accountCredentials(account);
    if (
      q["hub.mode"] === "subscribe" &&
      q["hub.verify_token"] &&
      q["hub.verify_token"] === creds["verifyToken"]
    ) {
      reply.header("content-type", "text/plain");
      return reply.send(q["hub.challenge"] ?? "");
    }
    throw unauthorized("Webhook verification failed");
  });

  // GET /webhooks/web/:accountId/thread — widget polls for new messages.
  // Per visitor+IP so one visitor can't starve others on a shared IP.
  fastify.get(
    "/web/:accountId/thread",
    {
      config: {
        rateLimit: {
          max: WIDGET_MAX(),
          timeWindow: "1 minute",
          keyGenerator: (req) => {
            const { accountId } = req.params as { accountId: string };
            const { visitorId } = req.query as { visitorId?: string };
            return visitorKey(req, accountId, visitorId);
          },
        },
      },
    },
    async (request) => {
    const { accountId } = request.params as { accountId: string };
    const q = z
      .object({ visitorId: z.string().min(1).max(200), limit: z.coerce.number().int().min(1).max(100).default(50) })
      .parse(request.query);
    const account = await prisma.channelAccount.findFirst({
      where: { id: accountId, type: "web", status: "connected" },
    });
    if (!account) throw notFound("Channel not found");
    const identity = await prisma.contactIdentity.findFirst({
      where: { workspaceId: account.workspaceId, channelAccountId: account.id, externalId: q.visitorId },
    });
    if (!identity) return { messages: [] };
    const conversation = await prisma.conversation.findFirst({
      where: { workspaceId: account.workspaceId, contactId: identity.contactId, channelAccountId: account.id },
      orderBy: { lastMessageAt: "desc" },
    });
    if (!conversation) return { messages: [] };
    const messages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { sentAt: "asc" },
      take: q.limit,
    });
    return { messages: messages.map(toApiMessage) };
  });

  // POST /webhooks/:type/:accountId — inbound provider events.
  // Provider posts (Meta/Telegram) get a high per-IP ceiling; widget posts are
  // keyed per visitor+IP. preHandler hook so the parsed body is available for
  // the visitor key.
  fastify.post(
    "/:type/:accountId",
    {
      config: {
        rateLimit: {
          hook: "preHandler",
          max: (req) => {
            const { type } = req.params as { type: string };
            return type === "web" ? WIDGET_MAX() : PROVIDER_POST_MAX();
          },
          keyGenerator: (req) => {
            const { type, accountId } = req.params as { type: string; accountId: string };
            if (type !== "web") return req.ip;
            const body = req.body as { visitorId?: unknown } | undefined;
            return visitorKey(req, accountId, body?.visitorId);
          },
        },
      },
    },
    async (request, reply) => {
    const { type, accountId } = request.params as { type: string; accountId: string };
    if (!CHANNEL_TYPES.includes(type as (typeof CHANNEL_TYPES)[number])) {
      throw badRequest("unknown_channel", "Unknown channel type");
    }
    const account = await prisma.channelAccount.findFirst({
      where: { id: accountId, type: type as ChannelAccountType, status: "connected" },
    });
    if (!account) throw notFound("Channel not found");

    const adapter = getAdapter(account.type);
    const creds = accountCredentials(account);
    if (adapter.verifyWebhook && !(await adapter.verifyWebhook(request, account, creds))) {
      throw unauthorized("Invalid webhook signature");
    }
    if (!adapter.parseWebhook) {
      throw badRequest("channel_unsupported", "Channel does not accept webhooks");
    }
    const parsed = adapter.parseWebhook(request.body, account, creds);
    if (parsed.events.length === 0 && (parsed.statuses?.length ?? 0) === 0) {
      return { ok: true, received: 0 };
    }
    await enqueueChannelInbound({
      accountId: account.id,
      events: parsed.events,
      statuses: parsed.statuses ?? [],
    });
    return reply.send({ ok: true, received: parsed.events.length });
  });
}
