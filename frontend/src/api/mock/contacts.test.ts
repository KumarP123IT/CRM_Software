import { describe, expect, it } from "vitest";
import { mockApi } from "./index";

describe("mock contacts api", () => {
  it("creates, filters and dedupes contacts", async () => {
    const created = await mockApi.contacts.create({
      name: "Test Person",
      phone: "9876501234",
      city: "Pune",
      tags: ["TestTag"],
    });
    expect(created.phone).toBe("+919876501234");

    // Same phone → upsert, not duplicate
    await mockApi.contacts.create({ name: "Renamed", phone: "+91 98765 01234" });
    const all = await mockApi.contacts.list({ search: "Renamed" });
    expect(all.total).toBe(1);

    const byTag = await mockApi.contacts.list({ tag: "TestTag" });
    expect(byTag.items.some((c) => c.name === "Renamed")).toBe(true);

    const bySource = await mockApi.contacts.list({ source: "manual" });
    expect(bySource.items.length).toBeGreaterThan(0);
  });

  it("bulk actions and opt-out", async () => {
    const c = await mockApi.contacts.create({ phone: "+919000000099", name: "Bulk" });
    await mockApi.contacts.bulk({ ids: [c.id], action: "setOptedOut", optedOut: true });
    const opted = await mockApi.contacts.list({ optedOut: true });
    expect(opted.items.some((x) => x.id === c.id)).toBe(true);
    await mockApi.contacts.bulk({ ids: [c.id], action: "delete" });
    await expect(mockApi.contacts.get(c.id)).rejects.toMatchObject({ status: 404 });
  });

  it("CSV import preview + commit", async () => {
    const csv = "name,phone,city\nImport One,91333333333,Mumbai\nDup,919876501234,Delhi";
    const preview = await mockApi.contacts.importPreview(csv);
    expect(preview.totals.new).toBe(1);
    expect(preview.totals.duplicates).toBe(1);

    const commit = await mockApi.contacts.importCommit(
      preview.rows.filter((r) => r.status !== "invalid").map((r) => r.data),
    );
    expect(commit.created).toBe(1);
    expect(commit.updated).toBe(1);
  });

  it("groups: static members and dynamic rules", async () => {
    const g = await mockApi.groups.create({ name: "Test static", kind: "static" });
    const c = await mockApi.contacts.create({
      phone: "+919111111199",
      name: "Member",
      city: "Goa",
    });
    await mockApi.groups.addMembers(g.id, [c.id]);
    const detail = await mockApi.groups.get(g.id);
    expect(detail.memberCount).toBe(1);

    const dyn = await mockApi.groups.create({
      name: "Goans",
      kind: "dynamic",
      rules: [{ field: "city", operator: "equals", value: "Goa" }],
    });
    const dynDetail = await mockApi.groups.get(dyn.id);
    expect(dynDetail.members.some((m) => m.id === c.id)).toBe(true);

    const filtered = await mockApi.contacts.list({ groupId: g.id });
    expect(filtered.items.some((x) => x.id === c.id)).toBe(true);
  });
});
