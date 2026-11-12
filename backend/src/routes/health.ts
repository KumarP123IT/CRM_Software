import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { redis } from "../lib/redis.js";

const READY_TIMEOUT_MS = 2000;

/**
 * Liveness vs readiness:
 *  - GET /health — process is up. No dependency checks; safe for a tight
 *    orchestrator liveness probe (a DB blip must not restart the process).
 *  - GET /ready  — dependencies answer. 200 only when Postgres AND Redis
 *    respond; 503 otherwise. Use for load-balancer / deploy readiness.
 */
export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get("/health", async () => {
    return { status: "ok" };
  });

  fastify.get("/ready", async (_request, reply) => {
    const checks: Record<string, "ok" | "fail"> = {};

    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = "ok";
    } catch {
      checks.database = "fail";
    }

    try {
      // ioredis queues commands while connecting — race a timeout so a dead
      // Redis can't hang the probe.
      await Promise.race([
        redis().ping(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("redis timeout")), READY_TIMEOUT_MS),
        ),
      ]);
      checks.redis = "ok";
    } catch {
      checks.redis = "fail";
    }

    const ready = Object.values(checks).every((v) => v === "ok");
    return reply.status(ready ? 200 : 503).send({
      status: ready ? "ready" : "not_ready",
      checks,
    });
  });
}
