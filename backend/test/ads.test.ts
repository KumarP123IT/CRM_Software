import { describe, expect, it } from "vitest";
import { agent, setupTestLifecycle } from "./helpers.js";

setupTestLifecycle();

async function setup() {
  const a = agent();
  await a.post("/api/auth/register").send({
    name: "Owner",
    email: "ads@t.in",
    password: "password123",
    business: "Ads Co",
    slug: "ads-co",
  });
  return a;
}

describe("ads", () => {
  it("CRUDs ads and tracks clicks via public redirect", async () => {
    const a = await setup();

    const created = await a.post("/api/ads").send({
      name: "Festive offer",
      phone: "+91 98765 43210",
      message: "Hi! Offer please",
    });
    expect(created.status).toBe(201);
    expect(created.body.phone).toBe("919876543210");
    expect(created.body.waLink).toContain("wa.me/919876543210");
    expect(created.body.clicks).toBe(0);

    const list = await a.get("/api/ads");
    expect(list.body).toHaveLength(1);

    // Public click → 302 to wa.me and increments counter.
    const click = await a.get(`/api/ads/click/${created.body.id}`);
    expect(click.status).toBe(302);
    expect(click.headers.location).toContain("wa.me/919876543210");

    const after = await a.get("/api/ads");
    expect(after.body[0].clicks).toBe(1);

    const patched = await a
      .patch(`/api/ads/${created.body.id}`)
      .send({ active: false, message: "New msg" });
    expect(patched.body.active).toBe(false);
    expect(patched.body.message).toBe("New msg");

    expect((await a.delete(`/api/ads/${created.body.id}`)).status).toBe(204);
    expect((await a.get("/api/ads")).body).toHaveLength(0);
  });

  it("isolates ads per workspace", async () => {
    const a = await setup();
    await a.post("/api/ads").send({ name: "A", phone: "1234567890" });

    const b = agent();
    await b.post("/api/auth/register").send({
      name: "Other",
      email: "other@t.in",
      password: "password123",
      business: "Other",
      slug: "other-co",
    });
    const list = await b.get("/api/ads");
    expect(list.body).toHaveLength(0);
  });
});
