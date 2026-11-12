import Fastify, {
  type FastifyInstance,
  type FastifyRequest,
  type FastifyServerOptions,
} from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import { ZodError } from "zod";
import { config, isTest } from "./config.js";
import { pinoOptions } from "./lib/logger.js";
import { captureException } from "./lib/sentry.js";
import { prisma } from "./lib/prisma.js";
import { AppError } from "./lib/errors.js";
import { authenticate } from "./plugins/auth.js";
import { authRoutes } from "./routes/auth.js";
import { workspaceRoutes } from "./routes/workspaces.js";
import { teamRoutes, teamsRoutes } from "./routes/team.js";
import { contactRoutes } from "./routes/contacts.js";
import { tagRoutes } from "./routes/tags.js";
import { groupRoutes } from "./routes/groups.js";
import { channelRoutes } from "./routes/channels.js";
import { conversationRoutes } from "./routes/conversations.js";
import { inboxEventRoutes } from "./routes/inbox-events.js";
import { webhookRoutes } from "./routes/webhooks.js";
import { templateRoutes } from "./routes/templates.js";
import { broadcastRoutes } from "./routes/broadcasts.js";
import { campaignRoutes } from "./routes/campaigns.js";
import { leadRoutes } from "./routes/leads.js";
import { callRoutes } from "./routes/calls.js";
import { dashboardRoutes } from "./routes/dashboard.js";
import { analyticsRoutes } from "./routes/analytics.js";
import { automationRoutes } from "./routes/automation.js";
import { botRoutes } from "./routes/bots.js";
import { integrationRoutes } from "./routes/integrations.js";
import { adRoutes } from "./routes/ads.js";
import { webhookEndpointRoutes } from "./routes/webhook-endpoints.js";
import { apiKeyRoutes } from "./routes/api-keys.js";
import { securityRoutes } from "./routes/security.js";
import { healthRoutes } from "./routes/health.js";
import { createHash } from "node:crypto";
import { WIDGET_SCRIPT } from "./lib/widget-script.js";
import {
  startBroadcastWorker,
  startChannelInboundWorker,
  startMailWorker,
  startWebhookWorker,
} from "./lib/jobs.js";

declare module "fastify" {
  interface FastifyInstance {
    prisma: typeof prisma;
  }
}

export interface BuildAppOptions {
  /** true = default pino, false = off, object = custom pino options. */
  logger?: boolean | FastifyServerOptions["logger"];
}

export async function buildApp(opts: BuildAppOptions = {}): Promise<FastifyInstance> {
  const logger =
    opts.logger !== undefined
      ? opts.logger
      : isTest
        ? false
        : pinoOptions;
  const app = Fastify({
    logger,
    trustProxy: true,
  });

  app.decorate("prisma", prisma);

  await app.register(cors, {
    // Public widget endpoints (/api/webhooks/web/*) are embedded on arbitrary
    // customer sites, so they allow any origin without credentials. Everything
    // else stays restricted to CORS_ORIGIN.
    delegator: async (req: FastifyRequest) => {
      const isWidget = req.url.startsWith("/api/webhooks/web/");
      return {
        origin: isWidget
          ? "*"
          : config.CORS_ORIGIN.split(",").map((s) => s.trim()),
        credentials: !isWidget,
      };
    },
  });
  await app.register(cookie);
  await app.register(jwt, { secret: config.JWT_SECRET });
  await app.register(rateLimit, {
    max: Math.round(300 * config.RATE_LIMIT_SCALE),
    timeWindow: "1 minute",
  });
  await app.register(authenticate);

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        code: "validation_error",
        message: "Invalid request",
        issues: error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      });
    }
    if (error instanceof AppError) {
      return reply.status(error.status).send({ code: error.code, message: error.message });
    }
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode === 429) {
      return reply.status(429).send({ code: "rate_limited", message: "Too many requests" });
    }
    if (statusCode === 400 || statusCode === 415) {
      return reply
        .status(400)
        .send({ code: "bad_request", message: (error as Error).message });
    }
    request.log.error(error);
    captureException(error);
    return reply.status(500).send({ code: "internal_error", message: "Something went wrong" });
  });

  app.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({ code: "not_found", message: "Not found" });
  });

  // Ops probes live at the root (not under /api) so load balancers and
  // orchestrators can hit them without knowing the API prefix. They are also
  // registered under /api for backwards compatibility.
  await app.register(healthRoutes);

  await app.register(
    async (api) => {
      await api.register(healthRoutes);
      await api.register(authRoutes, { prefix: "/auth" });
      await api.register(workspaceRoutes, { prefix: "/workspaces" });
      await api.register(teamRoutes, { prefix: "/team" });
      await api.register(teamsRoutes, { prefix: "/teams" });
      await api.register(contactRoutes, { prefix: "/contacts" });
      await api.register(tagRoutes, { prefix: "/tags" });
      await api.register(groupRoutes, { prefix: "/groups" });
      await api.register(channelRoutes, { prefix: "/channels" });
      await api.register(conversationRoutes, { prefix: "/conversations" });
      await api.register(inboxEventRoutes, { prefix: "/conversations" });
      await api.register(webhookRoutes, { prefix: "/webhooks" });
      await api.register(leadRoutes, { prefix: "/leads" });
      await api.register(callRoutes, { prefix: "/calls" });
      await api.register(dashboardRoutes, { prefix: "/dashboard" });
      await api.register(analyticsRoutes, { prefix: "/analytics" });
      await api.register(automationRoutes, { prefix: "/automation" });
      await api.register(botRoutes, { prefix: "/bots" });
      await api.register(integrationRoutes, { prefix: "/integrations" });
      await api.register(adRoutes, { prefix: "/ads" });
      await api.register(webhookEndpointRoutes, { prefix: "/webhook-endpoints" });
      await api.register(apiKeyRoutes, { prefix: "/api-keys" });
      await api.register(securityRoutes, { prefix: "/auth" });
      await api.register(templateRoutes, { prefix: "/templates" });
      await api.register(broadcastRoutes, { prefix: "/broadcasts" });
      await api.register(campaignRoutes, { prefix: "/campaigns" });
    },
    { prefix: "/api" },
  );

  // Embeddable chat widget — the snippet in settings points here.
  // Loaded via a cross-origin <script> tag, so it must opt out of
  // Cross-Origin-Resource-Policy (helmet-style defaults would block it) and
  // be sniff-proof. ETag + short cache keep repeat page loads cheap.
  const widgetEtag = `W/"${createHash("sha256").update(WIDGET_SCRIPT).digest("hex")}"`;
  app.get("/widget.js", async (request, reply) => {
    if (request.headers["if-none-match"] === widgetEtag) {
      return reply.status(304).send();
    }
    return reply
      .header("content-type", "application/javascript; charset=utf-8")
      .header("cache-control", "public, max-age=300")
      .header("etag", widgetEtag)
      .header("cross-origin-resource-policy", "cross-origin")
      .header("x-content-type-options", "nosniff")
      .send(WIDGET_SCRIPT);
  });

  startMailWorker();
  startChannelInboundWorker();
  startBroadcastWorker();
  startWebhookWorker();
  return app;
}
