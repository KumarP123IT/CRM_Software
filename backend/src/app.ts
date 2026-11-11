import Fastify, { type FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import { ZodError } from "zod";
import { config } from "./config.js";
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
import { healthRoutes } from "./routes/health.js";
import {
  startBroadcastWorker,
  startChannelInboundWorker,
  startMailWorker,
} from "./lib/jobs.js";

declare module "fastify" {
  interface FastifyInstance {
    prisma: typeof prisma;
  }
}

export interface BuildAppOptions {
  logger?: boolean;
}

export async function buildApp(opts: BuildAppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: opts.logger ?? config.NODE_ENV !== "test",
    trustProxy: true,
  });

  app.decorate("prisma", prisma);

  await app.register(cors, {
    origin: config.CORS_ORIGIN.split(",").map((s) => s.trim()),
    credentials: true,
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
    return reply.status(500).send({ code: "internal_error", message: "Something went wrong" });
  });

  app.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({ code: "not_found", message: "Not found" });
  });

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
      await api.register(templateRoutes, { prefix: "/templates" });
      await api.register(broadcastRoutes, { prefix: "/broadcasts" });
      await api.register(campaignRoutes, { prefix: "/campaigns" });
    },
    { prefix: "/api" },
  );

  startMailWorker();
  startChannelInboundWorker();
  startBroadcastWorker();
  return app;
}
