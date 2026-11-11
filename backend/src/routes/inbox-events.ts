import type { FastifyInstance } from "fastify";
import { z } from "zod";
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
    res.writeHead(200, {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
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
