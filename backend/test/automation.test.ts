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

async function webChannel(a: ReturnType<typeof agent>) {
  const connect = await a.post("/api/channels/connect").send({ type: "web", name: "Widget" });
  const accountId = connect.body.id as string;
  const detail = await a.get(`/api/channels/${accountId}`);
  return { accountId, token: detail.body.widgetToken as string };
}

async function inbound(
  a: ReturnType<typeof agent>,
  accountId: string,
  token: string,
  text: string,
  messageId: string,
) {
  return a.post(`/api/webhooks/web/${accountId}`).send({
    widgetToken: token,
    visitorId: "v1",
    name: "Visitor",
    text,
    messageId,
  });
}

async function conversationMessages(a: ReturnType<typeof agent>) {
  const convos = await a.get("/api/conversations");
  const convo = convos.body.items[0];
  const msgs = await a.get(`/api/conversations/${convo.id}/messages`);
  return msgs.body as { direction: string; body: string; authorId: string | null }[];
}

describe("automation", () => {
  it("auto-replies on first message and keyword, once each", async () => {
    const a = await setup();
    const { accountId, token } = await webChannel(a);

    await a.post("/api/automation/auto-replies").send({
      name: "Welcome",
      trigger: "first_message",
      response: "Hi there! How can we help?",
    });
    await a.post("/api/automation/auto-replies").send({
      name: "Pricing",
      trigger: "keyword",
      keywords: ["price", "cost"],
      response: "Our pricing starts at ₹499.",
    });

    // First inbound triggers welcome + keyword (contains "price")
    await inbound(a, accountId, token, "what is the price?", "m1");
    const msgs = await conversationMessages(a);
    const outbound = msgs.filter((m) => m.direction === "out");
    expect(outbound.map((m) => m.body)).toEqual(
      expect.arrayContaining(["Hi there! How can we help?", "Our pricing starts at ₹499."]),
    );
    expect(outbound.every((m) => !m.authorId)).toBe(true);

    // Second inbound: no first_message, but keyword still fires on "cost"
    await inbound(a, accountId, token, "and the cost?", "m2");
    const msgs2 = await conversationMessages(a);
    const pricingCount = msgs2.filter(
      (m) => m.direction === "out" && m.body === "Our pricing starts at ₹499.",
    ).length;
    expect(pricingCount).toBe(2);
    const welcomes = msgs2.filter(
      (m) => m.direction === "out" && m.body === "Hi there! How can we help?",
    );
    expect(welcomes).toHaveLength(1);
  });

  it("runs bots and increments runs counter", async () => {
    const a = await setup();
    const { accountId, token } = await webChannel(a);

    const bot = await a.post("/api/bots").send({
      name: "Status bot",
      trigger: { type: "keyword", keywords: ["status"], response: "Checking your order…" },
    });
    expect(bot.status).toBe(201);

    await inbound(a, accountId, token, "order status please", "m1");
    const msgs = await conversationMessages(a);
    expect(msgs.some((m) => m.direction === "out" && m.body === "Checking your order…")).toBe(true);

    const list = await a.get("/api/bots");
    expect(list.body[0].runs).toBe(1);

    // toggle off → no more runs
    await a.patch(`/api/bots/${bot.body.id}`).send({ active: false });
    await inbound(a, accountId, token, "status again", "m2");
    const list2 = await a.get("/api/bots");
    expect(list2.body[0].runs).toBe(1);
  });

  it("sends outside-hours reply only when configured hours exclude now", async () => {
    const a = await setup();
    const { accountId, token } = await webChannel(a);

    // Force "closed": open 00:00–00:00 today (UTC) → now is never inside.
    const day = new Date().getUTCDay();
    const put = await a.put("/api/automation/business-hours").send({
      enabled: true,
      timezone: "UTC",
      hours: [{ day, open: "00:00", close: "00:00" }],
    });
    expect(put.status).toBe(200);

    await a.post("/api/automation/auto-replies").send({
      name: "Away",
      trigger: "outside_hours",
      response: "We're offline — leave a message.",
    });

    await inbound(a, accountId, token, "hello?", "m1");
    const msgs = await conversationMessages(a);
    const away = msgs.filter((m) => m.direction === "out" && m.body.includes("offline"));
    expect(away.length).toBe(1);

    // Re-open hours → no away reply on next inbound
    await a.put("/api/automation/business-hours").send({
      enabled: true,
      timezone: "UTC",
      hours: [{ day, open: "00:00", close: "23:59" }],
    });
    await inbound(a, accountId, token, "still there?", "m2");
    const msgs2 = await conversationMessages(a);
    const away2 = msgs2.filter((m) => m.direction === "out" && m.body.includes("offline"));
    expect(away2).toHaveLength(1);
  });

  it("CRUDs auto-replies and validates keyword trigger", async () => {
    const a = await setup();
    const bad = await a.post("/api/automation/auto-replies").send({
      trigger: "keyword",
      response: "hi",
    });
    expect(bad.status).toBe(400);

    const created = await a.post("/api/automation/auto-replies").send({
      trigger: "first_message",
      response: "Welcome!",
    });
    expect(created.status).toBe(201);

    const patched = await a
      .patch(`/api/automation/auto-replies/${created.body.id}`)
      .send({ active: false });
    expect(patched.body.active).toBe(false);

    expect((await a.delete(`/api/automation/auto-replies/${created.body.id}`)).status).toBe(204);
  });
});
