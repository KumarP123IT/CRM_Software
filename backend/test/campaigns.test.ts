import { describe, expect, it } from "vitest";
import { agent, setupTestLifecycle } from "./helpers.js";

setupTestLifecycle();

async function setup() {
  const a = agent();
  await a.post("/api/auth/register").send({
    name: "Owner",
    email: "owner@c2.in",
    password: "password123",
    business: "Biz",
    slug: "biz-c2",
  });
  return a;
}

describe("campaigns", () => {
  it("supports CRUD and groups broadcasts", async () => {
    const a = await setup();

    const created = await a.post("/api/campaigns").send({
      name: "Diwali 2026",
      description: "Seasonal promo push",
    });
    expect(created.status).toBe(201);
    expect(created.body.status).toBe("draft");
    expect(created.body.broadcastCount).toBe(0);

    const list = await a.get("/api/campaigns");
    expect(list.body).toHaveLength(1);

    // Draft template can't back a broadcast — approve one first.
    const t = await a.post("/api/templates").send({
      name: "camp_tpl",
      category: "Marketing",
      language: "en",
      body: "Campaign message",
    });
    await a.post(`/api/templates/${t.body.id}/submit`);
    await a.post(`/api/templates/${t.body.id}/approve`);

    // No connected channel → broadcast dispatch marks it failed, but the
    // campaign linkage is what we're testing.
    const b = await a.post("/api/broadcasts").send({
      name: "Campaign blast",
      templateId: t.body.id,
      audience: "all",
      campaignId: created.body.id,
    });
    expect(b.status).toBe(201);
    expect(b.body.campaignId).toBe(created.body.id);

    const detail = await a.get(`/api/campaigns/${created.body.id}`);
    expect(detail.body.name).toBe("Diwali 2026");
    expect(detail.body.broadcastCount).toBe(1);
    expect(detail.body.broadcasts).toHaveLength(1);
    expect(detail.body.broadcasts[0].name).toBe("Campaign blast");

    const patched = await a
      .patch(`/api/campaigns/${created.body.id}`)
      .send({ status: "active", description: "Live" });
    expect(patched.body.status).toBe("active");
    expect(patched.body.description).toBe("Live");

    const del = await a.delete(`/api/campaigns/${created.body.id}`);
    expect(del.status).toBe(204);
    // Broadcast survives, unlinked from the campaign.
    const orphan = await a.get(`/api/broadcasts/${b.body.id}`);
    expect(orphan.body.campaignId).toBeUndefined();
  });
});
