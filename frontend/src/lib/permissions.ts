import type { Role } from "@/api/types";
import { useEffectiveRole } from "@/stores/auth";

export type Permission =
  | "conversation.reply"
  | "conversation.assign"
  | "contact.create"
  | "contact.delete"
  | "broadcast.create"
  | "template.create"
  | "lead.edit"
  | "bot.edit"
  | "ai.configure"
  | "ads.manage"
  | "analytics.view"
  | "settings.manage"
  | "billing.manage"
  | "team.invite";

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

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
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

export const ROLE_LABEL: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  agent: "Agent",
  readonly: "Read-only",
};

export function can(role: Role, perm: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(perm);
}

/** Minimum role that has a permission, for "why is this disabled" tooltips. */
export function deniedReason(perm: Permission): string {
  const order: Role[] = ["agent", "manager", "admin", "owner"];
  const min = order.find((r) => can(r, perm)) ?? "owner";
  return `Only ${ROLE_LABEL[min]}s and above can do this. Ask your workspace owner for access.`;
}

export function usePermission(perm: Permission) {
  const role = useEffectiveRole();
  const allowed = can(role, perm);
  return { allowed, reason: allowed ? undefined : deniedReason(perm), role };
}
