import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import type { FastifyInstance } from "fastify";

// Scale way down: shared widget per-IP ceiling = Math.round(120 * 0.02) = 2.
vi.stubEnv("RATE_LIMIT_SCALE", "0.02");

const { buildApp } = await import("../src/app.js");
const { prisma } = await import("../src/lib/prisma.js");
const { closeQueues } = await import("../src/lib/jobs.js");

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp({ logger: false });
});

afterAll(async () => {
  await app.close();
  await closeQueues();
  await prisma.$disconnect();
});

describe("widget per-IP ceiling", () => {
  it("caps all widget routes combined per IP, regardless of visitor identity", async () => {
    // Token issuance shares the ceiling with thread polls and message posts.
    const tokenUrl = "/api/webhooks/web/fake-account/token";
    const r1 = await app.inject({ method: "POST", url: tokenUrl, payload: {} });
    const r2 = await app.inject({ method: "POST", url: tokenUrl, payload: {} });
    expect(r1.statusCode).toBe(404);
    expect(r2.statusCode).toBe(404);

    // Third call from the same IP — even with a fresh visitor identity — is blocked.
    const thread = await app.inject({
      method: "GET",
      url: "/api/webhooks/web/fake-account/thread?visitorId=brand-new-visitor",
    });
    expect(thread.statusCode).toBe(429);
  });
});
