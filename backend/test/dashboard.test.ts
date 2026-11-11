import { describe, expect, it } from "vitest";
import { agent, setupTestLifecycle } from "./helpers.js";

setupTestLifecycle();

async function setup() {
  const a = agent();
  await a.post("/api/auth/register").send({
    name: "Owner",
    email: "owner@t.in",
    password: "password123",
    business: "Biz",
    slug: "biz-t",
  });
  return a;
}

/** Spin up a web channel and drop one inbound message so stats/activity have data. */
async function seedActivity(a: ReturnType<typeof agent>) {
  const connect = await a.post("/api/channels/connect").send({ type: "web", name: "Widget" });
  const accountId = connect.body.id as string;
  const detail = await a.get(`/api/channels/${accountId}`);
  await a.post(`/api/webhooks/web/${accountId}`).send({
    widgetToken: detail.body.widgetToken,
    visitorId: "v1",
    name: "Web Visitor",
    text: "hello",
    messageId: "wm-1",
  });
  const contact = await a.post("/api/contacts").send({ name: "Lead Person", phone: "+919812345678" });
  await a.post("/api/leads").send({ contactId: contact.body.id, title: "Deal", value: 1000 });
  await a.post("/api/calls/reminders").send({
    contactName: "Lead Person",
    phone: "+919812345678",
    at: new Date(Date.now() + 3600_000).toISOString(),
  });
}

describe("dashboard", () => {
  it("returns stats, activity, reminders and onboarding", async () => {
    const a = await setup();
    await seedActivity(a);

    const stats = await a.get("/api/dashboard/stats");
    expect(stats.status).toBe(200);
    expect(stats.body.openConversations.value).toBe(1);
    expect(stats.body.messagesToday.trend).toHaveLength(7);
    expect(stats.body.newLeads.trend).toHaveLength(7);
    expect(stats.body.avgResponseMins.trend).toHaveLength(7);

    const activity = await a.get("/api/dashboard/activity");
    expect(activity.status).toBe(200);
    expect(activity.body.length).toBeGreaterThan(0);
    expect(activity.body[0]).toHaveProperty("kind");

    const reminders = await a.get("/api/dashboard/call-reminders");
    expect(reminders.body).toHaveLength(1);
    expect(reminders.body[0].contactName).toBe("Lead Person");

    const onboarding = await a.get("/api/dashboard/onboarding");
    const byId = Object.fromEntries(onboarding.body.map((s: { id: string; done: boolean }) => [s.id, s.done]));
    expect(byId.connect).toBe(true);
    expect(byId.bypass).toBeUndefined();
  });

  it("onboarding reflects empty workspace", async () => {
    const a = await setup();
    const onboarding = await a.get("/api/dashboard/onboarding");
    expect(onboarding.body.map((s: { id: string }) => s.id)).toEqual([
      "connect",
      "import",
      "template",
      "invite",
      "broadcast",
    ]);
    const connect = onboarding.body.find((s: { id: string }) => s.id === "connect");
    expect(connect.done).toBe(false);
  });
});

describe("analytics", () => {
  it("returns overview metrics", async () => {
    const a = await setup();
    await seedActivity(a);

    const res = await a.get("/api/analytics/overview?days=30");
    expect(res.status).toBe(200);
    expect(res.body.days).toBe(30);
    expect(res.body.totals.contacts).toBeGreaterThanOrEqual(2);
    expect(res.body.totals.conversations).toBe(1);
    expect(res.body.totals.messagesIn).toBe(1);
    expect(res.body.leadsByStage).toEqual(
      expect.arrayContaining([expect.objectContaining({ stage: "new", count: 1, value: 1000 })]),
    );
    expect(res.body.channelBreakdown[0].channel).toBe("web");
    expect(res.body.messagesByDay.length).toBeGreaterThan(0);
  });

  it("readonly member can view analytics", async () => {
    await setup();
    const { prisma } = await import("../src/lib/prisma.js");
    const { hashPassword } = await import("../src/lib/password.js");
    const ws = await prisma.workspace.findFirstOrThrow();
    const user = await prisma.user.create({
      data: { name: "ro", email: "ro@t.in", passwordHash: await hashPassword("password123") },
    });
    await prisma.membership.create({
      data: { workspaceId: ws.id, userId: user.id, role: "readonly" },
    });
    const ro = agent();
    await ro.post("/api/auth/login").send({ email: "ro@t.in", password: "password123" });
    const res = await ro.get("/api/analytics/overview");
    expect(res.status).toBe(200);
  });
});
