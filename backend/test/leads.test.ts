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

async function makeContact(a: ReturnType<typeof agent>, phone = "+919812345678") {
  const res = await a.post("/api/contacts").send({ name: "Lead Person", phone });
  return res.body.id as string;
}

describe("leads", () => {
  it("creates, lists, updates stage and deletes leads", async () => {
    const a = await setup();
    const contactId = await makeContact(a);

    const created = await a.post("/api/leads").send({
      contactId,
      title: "Catering deal",
      value: 50000,
    });
    expect(created.status).toBe(201);
    expect(created.body.stage).toBe("new");
    expect(created.body.value).toBe(50000);
    expect(created.body.contactName).toBe("Lead Person");
    expect(created.body.ownerName).toBe("Owner");

    // move stage
    const moved = await a.patch(`/api/leads/${created.body.id}`).send({ stage: "qualified" });
    expect(moved.body.stage).toBe("qualified");

    // list filters
    const filtered = await a.get("/api/leads?stage=qualified");
    expect(filtered.body.total).toBe(1);
    const missed = await a.get("/api/leads?stage=won");
    expect(missed.body.total).toBe(0);

    // detail
    const detail = await a.get(`/api/leads/${created.body.id}`);
    expect(detail.body.title).toBe("Catering deal");

    // delete
    expect((await a.delete(`/api/leads/${created.body.id}`)).status).toBe(204);
    expect((await a.get(`/api/leads/${created.body.id}`)).status).toBe(404);
  });

  it("rejects leads for foreign contacts and foreign owners", async () => {
    const a = await setup();
    // foreign contact
    const res = await a.post("/api/leads").send({ contactId: "nonexistent", title: "x" });
    expect(res.status).toBe(404);
    // foreign owner
    const contactId = await makeContact(a);
    const res2 = await a
      .post("/api/leads")
      .send({ contactId, title: "x", ownerId: "nonexistent-user" });
    expect(res2.status).toBe(400);
  });

  it("isolates leads per workspace", async () => {
    const a = await setup();
    const contactId = await makeContact(a);
    const lead = await a.post("/api/leads").send({ contactId, title: "mine" });

    // second workspace
    const b = agent();
    await b.post("/api/auth/register").send({
      name: "Other",
      email: "other@t.in",
      password: "password123",
      business: "Biz2",
      slug: "biz-2",
    });
    const list = await b.get("/api/leads");
    expect(list.body.total).toBe(0);
    expect((await b.get(`/api/leads/${lead.body.id}`)).status).toBe(404);
    expect((await b.delete(`/api/leads/${lead.body.id}`)).status).toBe(404);
    // can't point a lead at another workspace's contact
    const cross = await b.post("/api/leads").send({ contactId, title: "steal" });
    expect(cross.status).toBe(404);
  });
});
