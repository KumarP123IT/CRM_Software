import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from "vitest";
import type { FastifyInstance } from "fastify";

const { buildApp } = await import("../src/app.js");
const { prisma } = await import("../src/lib/prisma.js");
const { closeQueues } = await import("../src/lib/jobs.js");
const { closeScheduler, runSchedulerTick, handleDelayedAutoReply } = await import(
  "../src/lib/scheduler.js"
);
const { encryptSecret } = await import("../src/lib/crypto.js");
const { hashPassword } = await import("../src/lib/password.js");

let app: FastifyInstance;
let wsId: string;
let contactId: string;
let accountId: string;

const MIN = 60_000;

beforeAll(async () => {
  app = await buildApp({ logger: false });
});

beforeEach(async () => {
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `;
  const names = tables.map((t) => `"${t.tablename}"`).join(", ");
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${names} RESTART IDENTITY CASCADE`);

  const ws = await prisma.workspace.create({
    data: { name: "Sched WS", slug: "sched-ws" },
  });
  wsId = ws.id;
  const user = await prisma.user.create({
    data: {
      name: "U",
      email: "u@sched.test",
      passwordHash: await hashPassword("password123"),
    },
  });
  await prisma.membership.create({
    data: { workspaceId: wsId, userId: user.id, role: "owner" },
  });
  const contact = await prisma.contact.create({
    data: { workspaceId: wsId, phone: "+15550001111", name: "Visitor" },
  });
  contactId = contact.id;
  const account = await prisma.channelAccount.create({
    data: {
      workspaceId: wsId,
      type: "web",
      status: "connected",
      displayName: "Widget",
      encryptedCredentials: encryptSecret(
        JSON.stringify({ widgetToken: "site-secret-token" }),
      ),
    },
  });
  accountId = account.id;
});

afterAll(async () => {
  await app.close();
  await closeQueues();
  await closeScheduler();
  await prisma.$disconnect();
});

async function makeConversation(data: Record<string, unknown> = {}) {
  return prisma.conversation.create({
    data: {
      workspaceId: wsId,
      contactId,
      channelAccountId: accountId,
      channel: "web",
      ...data,
    },
  });
}

describe("scheduler sweeps", () => {
  it("wakes snoozed conversations once their snooze expires", async () => {
    const now = new Date("2026-11-12T12:00:00Z");
    const past = await makeConversation({ snoozedUntil: new Date(now.getTime() - MIN) });
    const future = await makeConversation({ snoozedUntil: new Date(now.getTime() + MIN) });

    await runSchedulerTick(now);

    const p = await prisma.conversation.findUniqueOrThrow({ where: { id: past.id } });
    const f = await prisma.conversation.findUniqueOrThrow({ where: { id: future.id } });
    expect(p.snoozedUntil).toBeNull();
    expect(f.snoozedUntil?.getTime()).toBe(now.getTime() + MIN);

    // Idempotent — second tick changes nothing.
    await runSchedulerTick(now);
    const p2 = await prisma.conversation.findUniqueOrThrow({ where: { id: past.id } });
    expect(p2.snoozedUntil).toBeNull();
  });

  it("detects SLA breaches exactly once", async () => {
    const now = new Date("2026-11-12T12:00:00Z");
    const breached = await makeConversation({
      slaDueAt: new Date(now.getTime() - MIN),
      status: "open",
    });
    const notYet = await makeConversation({
      slaDueAt: new Date(now.getTime() + MIN),
      status: "open",
    });
    const resolved = await makeConversation({
      slaDueAt: new Date(now.getTime() - MIN),
      status: "resolved",
    });

    await runSchedulerTick(now);

    const b = await prisma.conversation.findUniqueOrThrow({ where: { id: breached.id } });
    const n = await prisma.conversation.findUniqueOrThrow({ where: { id: notYet.id } });
    const r = await prisma.conversation.findUniqueOrThrow({ where: { id: resolved.id } });
    expect(b.slaBreachedAt?.getTime()).toBe(now.getTime());
    expect(n.slaBreachedAt).toBeNull();
    expect(r.slaBreachedAt).toBeNull();

    // Second tick must not overwrite the original breach timestamp.
    await runSchedulerTick(new Date(now.getTime() + 10 * MIN));
    const b2 = await prisma.conversation.findUniqueOrThrow({ where: { id: breached.id } });
    expect(b2.slaBreachedAt?.getTime()).toBe(now.getTime());
  });

  it("marks due call reminders notified once", async () => {
    const now = new Date("2026-11-12T12:00:00Z");
    const due = await prisma.callReminder.create({
      data: {
        workspaceId: wsId,
        contactName: "Caller",
        phone: "+15550002222",
        at: new Date(now.getTime() - MIN),
      },
    });
    const future = await prisma.callReminder.create({
      data: {
        workspaceId: wsId,
        contactName: "Later",
        phone: "+15550003333",
        at: new Date(now.getTime() + MIN),
      },
    });
    const done = await prisma.callReminder.create({
      data: {
        workspaceId: wsId,
        contactName: "Done",
        phone: "+15550004444",
        at: new Date(now.getTime() - MIN),
        done: true,
      },
    });

    await runSchedulerTick(now);

    const d = await prisma.callReminder.findUniqueOrThrow({ where: { id: due.id } });
    const fu = await prisma.callReminder.findUniqueOrThrow({ where: { id: future.id } });
    const dn = await prisma.callReminder.findUniqueOrThrow({ where: { id: done.id } });
    expect(d.notifiedAt?.getTime()).toBe(now.getTime());
    expect(fu.notifiedAt).toBeNull();
    expect(dn.notifiedAt).toBeNull();

    await runSchedulerTick(now);
    const d2 = await prisma.callReminder.findUniqueOrThrow({ where: { id: due.id } });
    expect(d2.notifiedAt?.getTime()).toBe(now.getTime());
  });

  it("auto-closes idle conversations per workspace setting", async () => {
    const now = new Date("2026-11-12T12:00:00Z");
    await prisma.workspace.update({
      where: { id: wsId },
      data: { autoCloseMinutes: 30 },
    });
    const idle = await makeConversation({
      lastMessageAt: new Date(now.getTime() - 45 * MIN),
    });
    const recent = await makeConversation({
      lastMessageAt: new Date(now.getTime() - 5 * MIN),
    });
    const snoozed = await makeConversation({
      lastMessageAt: new Date(now.getTime() - 45 * MIN),
      snoozedUntil: new Date(now.getTime() + MIN),
    });

    await runSchedulerTick(now);

    const i = await prisma.conversation.findUniqueOrThrow({ where: { id: idle.id } });
    const rc = await prisma.conversation.findUniqueOrThrow({ where: { id: recent.id } });
    const s = await prisma.conversation.findUniqueOrThrow({ where: { id: snoozed.id } });
    expect(i.status).toBe("resolved");
    expect(rc.status).toBe("open");
    expect(s.status).toBe("open");

    // Idempotent — already resolved stays resolved, no error.
    await runSchedulerTick(now);
    const i2 = await prisma.conversation.findUniqueOrThrow({ where: { id: idle.id } });
    expect(i2.status).toBe("resolved");
  });
});

describe("delayed auto-reply", () => {
  beforeEach(() => {
    // Only fake what we need — faking setImmediate/nextTick breaks Prisma and
    // fastify.inject internals.
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  /** Let the fired (void) async handler finish its real DB I/O. */
  async function flushHandler() {
    vi.useRealTimers();
    await new Promise((r) => setTimeout(r, 250));
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
  }

  async function login() {
    const res = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "u@sched.test", password: "password123" },
    });
    const { token } = res.json() as { token: string };
    return { authorization: `Bearer ${token}` };
  }

  async function loginAndChannel() {
    const headers = await login();
    const rule = await app.inject({
      method: "POST",
      url: "/api/automation/auto-replies",
      headers,
      payload: {
        name: "Slow reply",
        trigger: "keyword",
        keywords: ["hello"],
        response: "Be right with you.",
        delaySeconds: 60,
      },
    });
    expect(rule.statusCode).toBe(201);
    return headers;
  }

  async function inbound(text: string, messageId: string) {
    return app.inject({
      method: "POST",
      url: `/api/webhooks/web/${accountId}`,
      payload: {
        widgetToken: "site-secret-token",
        visitorId: "v-sched",
        name: "Visitor",
        text,
        messageId,
      },
    });
  }

  async function outboundBodies() {
    const conv = await prisma.conversation.findFirstOrThrow({
      where: { workspaceId: wsId },
    });
    const msgs = await prisma.message.findMany({
      where: { conversationId: conv.id, direction: "out" },
      select: { body: true },
    });
    return msgs.map((m) => m.body);
  }

  it("delays the reply until the timer fires", async () => {
    await loginAndChannel();

    const res = await inbound("hello there", "m1");
    expect(res.statusCode).toBeLessThan(300);

    // Not sent yet — the 60s delay hasn't elapsed.
    expect(await outboundBodies()).not.toContain("Be right with you.");

    await vi.advanceTimersByTimeAsync(61_000);
    await flushHandler();
    expect(await outboundBodies()).toContain("Be right with you.");
  });

  it("is idempotent — the handler refuses to send twice", async () => {
    await loginAndChannel();
    await inbound("hello there", "m1");
    await vi.advanceTimersByTimeAsync(61_000);
    await flushHandler();
    expect(await outboundBodies()).toContain("Be right with you.");

    // Replay the same job payload — the already-sent guard must skip it.
    const conv = await prisma.conversation.findFirstOrThrow({
      where: { workspaceId: wsId },
    });
    const trigger = await prisma.message.findFirstOrThrow({
      where: { conversationId: conv.id, direction: "in" },
      orderBy: { sentAt: "desc" },
    });
    const rule = await prisma.autoReply.findFirstOrThrow({
      where: { workspaceId: wsId },
    });
    const job = {
      workspaceId: wsId,
      conversationId: conv.id,
      accountId,
      contactId,
      body: "Be right with you.",
      triggerMessageId: trigger.id,
      delaySeconds: 60,
      sourceKind: "autoReply" as const,
      sourceId: rule.id,
    };
    await handleDelayedAutoReply(job);
    await handleDelayedAutoReply(job);
    expect(
      (await outboundBodies()).filter((b) => b === "Be right with you."),
    ).toHaveLength(1);
  });

  it("skips the delayed reply when a newer inbound arrives first", async () => {
    await loginAndChannel();

    await inbound("hello there", "m1");
    // Customer follows up before the delay elapses.
    await inbound("actually wait — one more thing", "m2");

    await vi.advanceTimersByTimeAsync(61_000);
    await flushHandler();
    expect(await outboundBodies()).not.toContain("Be right with you.");
  });
});

describe("SLA lifecycle", () => {
  it("sets slaDueAt on first inbound and clears it on agent reply", async () => {
    const headers = { authorization: `Bearer ${(await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "u@sched.test", password: "password123" },
    })).json().token}` };

    const before = Date.now();
    await app.inject({
      method: "POST",
      url: `/api/webhooks/web/${accountId}`,
      payload: {
        widgetToken: "site-secret-token",
        visitorId: "v-sla",
        name: "Visitor",
        text: "hi",
        messageId: "sla-m1",
      },
    });

    const conv = await prisma.conversation.findFirstOrThrow({
      where: { workspaceId: wsId },
    });
    // Workspace default slaMinutes = 15.
    expect(conv.slaDueAt).not.toBeNull();
    const dueMs = conv.slaDueAt!.getTime() - before;
    expect(dueMs).toBeGreaterThan(14 * MIN);
    expect(dueMs).toBeLessThanOrEqual(15 * MIN + 5000);

    const reply = await app.inject({
      method: "POST",
      url: `/api/conversations/${conv.id}/messages`,
      headers,
      payload: { kind: "text", body: "Hi! How can I help?" },
    });
    expect(reply.statusCode).toBe(201);

    const after = await prisma.conversation.findUniqueOrThrow({ where: { id: conv.id } });
    expect(after.slaDueAt).toBeNull();
  });
});
