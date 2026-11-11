import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { config } from "../config.js";
import { resolveWorkspace } from "../plugins/auth.js";
import { subscribeInbox } from "../lib/events.js";

interface JwtPayload {
  sub: string;
  [key: string]: unknown;
}

/**
 * GET /conversations/events — SSE stream of inbox realtime events.
 *
 * Separate plugin from conversationRoutes so EventSource clients can
 * authenticate via ?token= (EventSource cannot set Authorization headers;
 * cookies still work for browser sessions).
 */
export async function inboxEventRoutes(fastify: FastifyInstance) {
  fastify.get("/events", async (request, reply) => {
    const q = z.object({ token: z.string().optional() }).parse(request.query ?? {});
    if (!request.userId && q.token) {
      try {
        const payload = fastify.jwt.verify<JwtPayload>(q.token);
        request.userId = payload.sub;
      } catch {
        // fall through — resolveWorkspace will 401
      }
    }
    await resolveWorkspace(request, reply);

    reply.hijack();
    const res = reply.raw;
    // hijack() bypasses @fastify/cors hooks — set ACAO manually so EventSource
    // (a credentialed cross-origin request) isn't blocked.
    const origin = request.headers.origin;
    const allowed = config.CORS_ORIGIN.split(",").map((s) => s.trim());
    const allowOrigin = origin && allowed.includes(origin) ? origin : allowed[0];
    res.writeHead(200, {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
      "access-control-allow-origin": allowOrigin ?? "*",
      vary: "Origin",
    });
    res.write("retry: 3000\n\n");

    const unsubscribe = subscribeInbox(request.workspaceId, (event) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    });
    const heartbeat = setInterval(() => {
      res.write(":hb\n\n");
    }, 25_000);
    heartbeat.unref?.();

    request.raw.on("close", () => {
      clearInterval(heartbeat);
      unsubscribe();
    });
  });
}
