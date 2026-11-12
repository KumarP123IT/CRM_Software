import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";

const { buildApp } = await import("../src/app.js");
const { closeQueues } = await import("../src/lib/jobs.js");
const { prisma } = await import("../src/lib/prisma.js");
const { WIDGET_SCRIPT } = await import("../src/lib/widget-script.js");

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp({ logger: false });
});

afterAll(async () => {
  await app.close();
  await closeQueues();
  await prisma.$disconnect();
});

describe("GET /widget.js", () => {
  it("serves the script with cross-origin embeddable headers", async () => {
    const res = await app.inject({ method: "GET", url: "/widget.js" });
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("application/javascript");
    // <script> tags ignore CORS but respect CORP — must be cross-origin.
    expect(res.headers["cross-origin-resource-policy"]).toBe("cross-origin");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["cache-control"]).toContain("max-age=");
    expect(res.headers.etag).toMatch(/^W\//);
    expect(res.body).toBe(WIDGET_SCRIPT);
  });

  it("returns 304 when If-None-Match matches", async () => {
    const first = await app.inject({ method: "GET", url: "/widget.js" });
    const etag = first.headers.etag as string;
    const second = await app.inject({
      method: "GET",
      url: "/widget.js",
      headers: { "if-none-match": etag },
    });
    expect(second.statusCode).toBe(304);
    expect(second.body).toBe("");
  });
});
