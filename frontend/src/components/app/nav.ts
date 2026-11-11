import {
  LayoutDashboard,
  MessagesSquare,
  Users,
  UsersRound,
  Megaphone,
  Rocket,
  FileText,
  BadgeIndianRupee,
  Target,
  PhoneCall,
  Workflow,
  Sparkles,
  MessageCircleReply,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Permission } from "@/lib/permissions";

export type AppPath =
  | "/dashboard"
  | "/conversations"
  | "/contacts"
  | "/groups"
  | "/broadcasts"
  | "/campaigns"
  | "/templates"
  | "/ads"
  | "/leads"
  | "/calls"
  | "/bots"
  | "/ai-agents"
  | "/comment-automation"
  | "/analytics"
  | "/settings";

export interface NavItem {
  key: string;
  to: AppPath;
  icon: LucideIcon;
  perm?: Permission;
}

export const NAV_GROUPS: { key: string; items: NavItem[] }[] = [
  {
    key: "home",
    items: [
      { key: "dashboard", to: "/dashboard", icon: LayoutDashboard },
      { key: "conversations", to: "/conversations", icon: MessagesSquare },
      { key: "contacts", to: "/contacts", icon: Users },
      { key: "groups", to: "/groups", icon: UsersRound },
    ],
  },
  {
    key: "marketing",
    items: [
      { key: "broadcasts", to: "/broadcasts", icon: Megaphone },
      { key: "campaigns", to: "/campaigns", icon: Rocket },
      { key: "templates", to: "/templates", icon: FileText },
      { key: "ads", to: "/ads", icon: BadgeIndianRupee, perm: "ads.manage" },
    ],
  },
  {
    key: "sales",
    items: [
      { key: "leads", to: "/leads", icon: Target },
      { key: "calls", to: "/calls", icon: PhoneCall },
    ],
  },
  {
    key: "automation",
    items: [
      { key: "bots", to: "/bots", icon: Workflow },
      { key: "aiAgents", to: "/ai-agents", icon: Sparkles },
      {
        key: "commentAutomation",
        to: "/comment-automation",
        icon: MessageCircleReply,
      },
    ],
  },
  {
    key: "reports",
    items: [
      {
        key: "analytics",
        to: "/analytics",
        icon: BarChart3,
        perm: "analytics.view",
      },
    ],
  },
];

export const SETTINGS_ITEM: NavItem = {
  key: "settings",
  to: "/settings",
  icon: Settings,
};

export const ALL_NAV: NavItem[] = [...NAV_GROUPS.flatMap((g) => g.items), SETTINGS_ITEM];
