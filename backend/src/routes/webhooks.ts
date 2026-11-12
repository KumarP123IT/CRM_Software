import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import type { ChannelAccountType } from "@prisma/client";
import { config } from "../config.js";
import { prisma } from "../lib/prisma.js";
import { badRequest, forbidden, notFound, tooMany, unauthorized } from "../lib/errors.js";
import { getAdapter } from "../channels/index.js";
import { accountCredentials, toApiMessage } from "../lib/inbox.js";
import { enqueueChannelInbound } from "../lib/jobs.js";
import {
  issueVisitorToken,
  verifyVisitorToken,
  visitorTokenExpiresAt,
} from "../lib/widget-auth.js";

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

interface WidgetVisitor {
  visitorId: string;
  /** true when a legacy visitorId was accepted — caller should issue a token. */
  upgraded: boolean;
}

/**
 * Resolve the widget visitor credential: a signed visitorToken, or a legacy
 * client-supplied visitorId while the grace period is enabled.
 */
function resolveWidgetVisitor(
  accountId: string,
  visitorToken: unknown,
  legacyVisitorId: unknown,
): WidgetVisitor {
  if (typeof visitorToken === "string" && visitorToken) {
    const vid = verifyVisitorToken(visitorToken, accountId);
    if (!vid) throw unauthorized("Invalid or expired visitor token");
    return { visitorId: vid, upgraded: false };
  }
  if (typeof legacyVisitorId === "string" && legacyVisitorId && config.WIDGET_LEGACY_VISITOR_ID) {
    return { visitorId: legacyVisitorId.slice(0, 200), upgraded: true };
  }
  throw badRequest(
    "visitor_token_required",
    "A visitor token is required — call POST /api/webhooks/web/:accountId/token first",
  );
}

/**
 * Enforce the workspace widget allow-list. Empty list = allow all. A missing
 * Origin header is allowed (non-browser clients can't be origin-checked).
 */
function assertWidgetOrigin(request: FastifyRequest, allowedDomains: string[]): void {
  if (allowedDomains.length === 0) return;
  const origin = request.headers.origin;
  if (!origin) return;
  let host: string;
  try {
    host = new URL(origin).hostname.toLowerCase();
  } catch {
    throw forbidden("Origin not allowed for this widget");
  }
  const allowed = allowedDomains.some((d) => host === d || host.endsWith(`.${d}`));
  if (!allowed) throw forbidden("Origin not allowed for this widget");
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

  // Shared per-IP ceiling across ALL widget routes (thread poll, message post,
  // token issuance) — rotating visitorId/visitorToken can't mint fresh buckets.
  const widgetIpLimit = fastify.createRateLimit({
    max: Math.round(120 * config.RATE_LIMIT_SCALE),
    timeWindow: "1 minute",
  });

  // GET /webhooks/web/:accountId/thread — widget polls for new messages.
  // Per visitor+IP bucket plus the shared per-IP ceiling above.
  fastify.get(
    "/web/:accountId/thread",
    {
      config: {
        rateLimit: {
          max: WIDGET_MAX(),
          timeWindow: "1 minute",
          keyGenerator: (req) => {
            const { accountId } = req.params as { accountId: string };
            const q = req.query as { visitorToken?: string; visitorId?: string };
            return visitorKey(req, accountId, q.visitorToken ?? q.visitorId);
          },
        },
      },
    },
    async (request) => {
    const ip = await widgetIpLimit(request);
    if (!ip.isAllowed && ip.isExceeded) throw tooMany();
    const { accountId } = request.params as { accountId: string };
    const q = z
      .object({
        visitorToken: z.string().max(1000).optional(),
        visitorId: z.string().min(1).max(200).optional(),
        limit: z.coerce.number().int().min(1).max(100).default(50),
      })
      .parse(request.query);
    const account = await prisma.channelAccount.findFirst({
      where: { id: accountId, type: "web", status: "connected" },
      include: { workspace: { select: { widgetAllowedDomains: true } } },
    });
    if (!account) throw notFound("Channel not found");
    assertWidgetOrigin(request, account.workspace.widgetAllowedDomains);
    const visitor = resolveWidgetVisitor(accountId, q.visitorToken, q.visitorId);
    const identity = await prisma.contactIdentity.findFirst({
      where: { workspaceId: account.workspaceId, channelAccountId: account.id, externalId: visitor.visitorId },
    });
    if (!identity) {
      return {
        messages: [],
        ...(visitor.upgraded
          ? { visitorToken: issueVisitorToken(accountId, visitor.visitorId), visitorTokenExpiresAt: visitorTokenExpiresAt() }
          : {}),
      };
    }
    const conversation = await prisma.conversation.findFirst({
      where: { workspaceId: account.workspaceId, contactId: identity.contactId, channelAccountId: account.id },
      orderBy: { lastMessageAt: "desc" },
    });
    if (!conversation) {
      return {
        messages: [],
        ...(visitor.upgraded
          ? { visitorToken: issueVisitorToken(accountId, visitor.visitorId), visitorTokenExpiresAt: visitorTokenExpiresAt() }
          : {}),
      };
    }
    const messages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { sentAt: "asc" },
      take: q.limit,
    });
    return {
      messages: messages.map(toApiMessage),
      ...(visitor.upgraded
        ? { visitorToken: issueVisitorToken(accountId, visitor.visitorId), visitorTokenExpiresAt: visitorTokenExpiresAt() }
        : {}),
    };
  });

  // POST /webhooks/web/:accountId/token — issue a signed visitor token.
  // Public by design: it only yields a visitor identity, and it shares the
  // per-IP ceiling with the other widget routes.
  fastify.post("/web/:accountId/token", async (request, reply) => {
    const ip = await widgetIpLimit(request);
    if (!ip.isAllowed && ip.isExceeded) throw tooMany();
    const { accountId } = request.params as { accountId: string };
    const body = z
      .object({ visitorId: z.string().trim().min(1).max(200).optional() })
      .parse(request.body ?? {});
    const account = await prisma.channelAccount.findFirst({
      where: { id: accountId, type: "web", status: "connected" },
      include: { workspace: { select: { widgetAllowedDomains: true } } },
    });
    if (!account) throw notFound("Channel not found");
    assertWidgetOrigin(request, account.workspace.widgetAllowedDomains);
    return reply.send({
      visitorToken: issueVisitorToken(accountId, body.visitorId),
      visitorTokenExpiresAt: visitorTokenExpiresAt(),
    });
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
            const body = req.body as { visitorId?: unknown; visitorToken?: unknown } | undefined;
            return visitorKey(req, accountId, body?.visitorToken ?? body?.visitorId);
          },
        },
      },
    },
    async (request, reply) => {
    const { type, accountId } = request.params as { type: string; accountId: string };
    if (!CHANNEL_TYPES.includes(type as (typeof CHANNEL_TYPES)[number])) {
      throw badRequest("unknown_channel", "Unknown channel type");
    }
    if (type === "web") {
      const ip = await widgetIpLimit(request);
      if (!ip.isAllowed && ip.isExceeded) throw tooMany();
    }
    const account = await prisma.channelAccount.findFirst({
      where: { id: accountId, type: type as ChannelAccountType, status: "connected" },
      include: { workspace: { select: { widgetAllowedDomains: true } } },
    });
    if (!account) throw notFound("Channel not found");

    const adapter = getAdapter(account.type);
    const creds = accountCredentials(account);
    if (adapter.verifyWebhook && !(await adapter.verifyWebhook(request, account, creds))) {
      throw unauthorized("Invalid webhook signature");
    }

    let widgetUpgrade: { visitorToken: string; visitorTokenExpiresAt: number } | undefined;
    if (account.type === "web") {
      assertWidgetOrigin(request, account.workspace.widgetAllowedDomains);
      const body = request.body as Record<string, unknown>;
      const visitor = resolveWidgetVisitor(
        accountId,
        body["visitorToken"],
        body["visitorId"],
      );
      // The adapter keys inbound messages on visitorId — inject the resolved id.
      body["visitorId"] = visitor.visitorId;
      if (visitor.upgraded) {
        widgetUpgrade = {
          visitorToken: issueVisitorToken(accountId, visitor.visitorId),
          visitorTokenExpiresAt: visitorTokenExpiresAt(),
        };
      }
    }

    if (!adapter.parseWebhook) {
      throw badRequest("channel_unsupported", "Channel does not accept webhooks");
    }
    const parsed = adapter.parseWebhook(request.body, account, creds);
    if (parsed.events.length === 0 && (parsed.statuses?.length ?? 0) === 0) {
      return reply.send({ ok: true, received: 0, ...(widgetUpgrade ?? {}) });
    }
    await enqueueChannelInbound({
      accountId: account.id,
      events: parsed.events,
      statuses: parsed.statuses ?? [],
    });
    return reply.send({ ok: true, received: parsed.events.length, ...(widgetUpgrade ?? {}) });
  });
}
