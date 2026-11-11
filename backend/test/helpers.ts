import { afterAll, beforeAll, beforeEach } from "vitest";
import type { FastifyInstance } from "fastify";
import request from "supertest";
import { buildApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { closeQueues, clearSentEmails } from "../src/lib/jobs.js";

let app: FastifyInstance | null = null;
let baseUrl = "";

export async function getApp(): Promise<FastifyInstance> {
  if (!app) {
    app = await buildApp({ logger: false });
    await app.listen({ port: 0, host: "127.0.0.1" });
    const addr = app.server.address();
    if (addr && typeof addr === "object") baseUrl = `http://127.0.0.1:${addr.port}`;
  }
  return app;
}

/** Fresh supertest agent — persists cookies like a browser. */
export function agent() {
  return request.agent(baseUrl);
}

/** Truncate all tables — fast, order-independent. */
export async function resetDb() {
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `;
  if (tables.length === 0) return;
  const names = tables.map((t) => `"${t.tablename}"`).join(", ");
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${names} RESTART IDENTITY CASCADE`);
}

export function setupTestLifecycle() {
  beforeAll(async () => {
    await getApp();
  });
  beforeEach(async () => {
    await resetDb();
    clearSentEmails();
  });
  afterAll(async () => {
    await app?.close();
    await closeQueues();
    await prisma.$disconnect();
  });
}
