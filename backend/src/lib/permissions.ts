// Mirrors frontend/src/lib/permissions.ts — keep the two matrices in sync.
// Backend enforcement is authoritative; frontend checks are UX only.
import type { Role } from "@prisma/client";

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

export function can(role: Role, perm: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(perm);
}
