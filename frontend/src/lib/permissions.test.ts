import { describe, expect, it } from "vitest";
import { can } from "./permissions";

describe("permissions", () => {
  it("lets managers create broadcasts", () =>
    expect(can("manager", "broadcast.create")).toBe(true));
  it("blocks agents from creating broadcasts", () =>
    expect(can("agent", "broadcast.create")).toBe(false));
  it("read-only users cannot reply", () =>
    expect(can("readonly", "conversation.reply")).toBe(false));
  it("only owners manage billing", () => {
    expect(can("owner", "billing.manage")).toBe(true);
    expect(can("admin", "billing.manage")).toBe(false);
  });
});
