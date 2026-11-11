import {
  Bell,
  Bot,
  Building2,
  Clock,
  CreditCard,
  FileText,
  Globe,
  KeyRound,
  Lock,
  MessageSquare,
  Palette,
  Shield,
  Smartphone,
  Tags,
  Users,
  UsersRound,
  Webhook,
  type LucideIcon,
} from "lucide-react";

export type SettingsPath =
  | "/settings"
  | "/settings/inboxes"
  | "/settings/business-hours"
  | "/settings/auto-replies"
  | "/settings/chat"
  | "/settings/notifications"
  | "/settings/team"
  | "/settings/teams"
  | "/settings/roles"
  | "/settings/billing"
  | "/settings/invoices"
  | "/settings/webhooks"
  | "/settings/openai"
  | "/settings/widget"
  | "/settings/workspaces"
  | "/settings/security"
  | "/settings/workspace-security"
  | "/settings/appearance"
  | "/settings/custom-fields"
  | "/settings/tags";

export interface SettingsNavItem {
  to: SettingsPath;
  label: string;
  icon: LucideIcon;
}

export interface SettingsNavGroup {
  key: string;
  label: string;
  items: SettingsNavItem[];
}

export const SETTINGS_NAV: SettingsNavGroup[] = [
  {
    key: "workspace",
    label: "Workspace",
    items: [
      { to: "/settings", label: "General", icon: Globe },
      { to: "/settings/inboxes", label: "Inboxes", icon: Smartphone },
      { to: "/settings/business-hours", label: "Business Hours", icon: Clock },
      { to: "/settings/auto-replies", label: "Auto-Replies", icon: MessageSquare },
      { to: "/settings/chat", label: "Chat Settings", icon: Bot },
    ],
  },
  {
    key: "communication",
    label: "Communication",
    items: [{ to: "/settings/notifications", label: "Notifications", icon: Bell }],
  },
  {
    key: "people",
    label: "People",
    items: [
      { to: "/settings/team", label: "Members", icon: Users },
      { to: "/settings/teams", label: "Teams", icon: UsersRound },
      { to: "/settings/roles", label: "Roles", icon: Shield },
    ],
  },
  {
    key: "billing",
    label: "Billing",
    items: [
      { to: "/settings/billing", label: "Subscription", icon: CreditCard },
      { to: "/settings/invoices", label: "Invoices", icon: FileText },
    ],
  },
  {
    key: "developer",
    label: "Developer",
    items: [
      { to: "/settings/webhooks", label: "Webhooks", icon: Webhook },
      { to: "/settings/openai", label: "OpenAI", icon: KeyRound },
    ],
  },
  {
    key: "integrations",
    label: "Integrations",
    items: [{ to: "/settings/widget", label: "Website Chat Widget", icon: MessageSquare }],
  },
  {
    key: "account",
    label: "Account",
    items: [
      { to: "/settings/workspaces", label: "My Workspaces", icon: Building2 },
      { to: "/settings/security", label: "Security", icon: Lock },
      {
        to: "/settings/workspace-security",
        label: "Workspace Security",
        icon: Shield,
      },
      { to: "/settings/appearance", label: "Appearance", icon: Palette },
    ],
  },
  {
    key: "contacts",
    label: "Contacts",
    items: [
      { to: "/settings/custom-fields", label: "Custom Fields", icon: FileText },
      { to: "/settings/tags", label: "Tags", icon: Tags },
    ],
  },
];

export function isSettingsPathActive(pathname: string, to: SettingsPath) {
  if (to === "/settings") return pathname === "/settings" || pathname === "/settings/";
  return pathname === to || pathname.startsWith(`${to}/`);
}
