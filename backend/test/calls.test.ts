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

describe("calls", () => {
  it("logs and lists call logs", async () => {
    const a = await setup();
    const contact = await a.post("/api/contacts").send({ name: "Caller", phone: "+919800011122" });

    const log = await a.post("/api/calls/logs").send({
      contactId: contact.body.id,
      phone: "+919800011122",
      direction: "outbound",
      durationSec: 120,
      note: "Discussed pricing",
      at: new Date(Date.now() - 3600_000).toISOString(),
    });
    expect(log.status).toBe(201);
    expect(log.body.contactName).toBe("Caller");
    expect(log.body.phone).toBe("+919800011122");

    const list = await a.get("/api/calls/logs");
    expect(list.body.total).toBe(1);

    const filtered = await a.get("/api/calls/logs?direction=inbound");
    expect(filtered.body.total).toBe(0);

    expect((await a.delete(`/api/calls/logs/${log.body.id}`)).status).toBe(204);
    expect((await a.get("/api/calls/logs")).body.total).toBe(0);
  });

  it("manages call reminders incl. done toggle", async () => {
    const a = await setup();
    const at = new Date(Date.now() + 3600_000).toISOString();

    const rem = await a.post("/api/calls/reminders").send({
      contactName: "Priya",
      phone: "+919812345678",
      note: "Call back",
      at,
    });
    expect(rem.status).toBe(201);
    expect(rem.body.done).toBe(false);

    const list = await a.get("/api/calls/reminders");
    expect(list.body).toHaveLength(1);

    const done = await a.patch(`/api/calls/reminders/${rem.body.id}`).send({ done: true });
    expect(done.body.done).toBe(true);
    // hidden by default now
    expect((await a.get("/api/calls/reminders")).body).toHaveLength(0);
    expect((await a.get("/api/calls/reminders?includeDone=true")).body).toHaveLength(1);

    expect((await a.delete(`/api/calls/reminders/${rem.body.id}`)).status).toBe(204);
  });

  it("isolates calls per workspace", async () => {
    const a = await setup();
    const rem = await a.post("/api/calls/reminders").send({
      contactName: "X",
      phone: "+919812345678",
      at: new Date().toISOString(),
    });
    const b = agent();
    await b.post("/api/auth/register").send({
      name: "Other",
      email: "other@t.in",
      password: "password123",
      business: "Biz2",
      slug: "biz-2",
    });
    expect((await b.get("/api/calls/reminders")).body).toHaveLength(0);
    expect((await b.delete(`/api/calls/reminders/${rem.body.id}`)).status).toBe(404);
  });
});
