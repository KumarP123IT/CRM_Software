import { describe, expect, it } from "vitest";
import type { Role } from "@/api/types";
import { can, ROLE_PERMISSIONS, type Permission } from "./permissions";

const ROLES: Role[] = ["owner", "admin", "manager", "agent", "readonly"];

const ALL: Permission[] = [
  "conversation.reply",
  "conversation.assign",
  "contact.create",
  "contact.delete",
  "broadcast.create",
  "template.create",
  "lead.edit",
  "bot.edit",
  "ai.configure",
  "ads.manage",
  "analytics.view",
  "settings.manage",
  "billing.manage",
  "team.invite",
];

/** Product RBAC contract — keep in lockstep with ROLE_PERMISSIONS. */
const EXPECTED: Record<Role, Permission[]> = {
  owner: ALL,
  admin: ALL.filter((p) => p !== "billing.manage"),
  manager: [
    "conversation.reply",
    "conversation.assign",
    "contact.create",
    "broadcast.create",
    "template.create",
    "lead.edit",
    "bot.edit",
    "analytics.view",
    "team.invite",
  ],
  agent: ["conversation.reply", "contact.create", "lead.edit"],
  readonly: ["analytics.view"],
};

describe("permissions matrix", () => {
  it.each(ROLES)("%s matches the documented grant list", (role) => {
    expect([...ROLE_PERMISSIONS[role]].sort()).toEqual([...EXPECTED[role]].sort());
    for (const perm of ALL) {
      expect(can(role, perm)).toBe(EXPECTED[role].includes(perm));
    }
  });

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
