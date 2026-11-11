import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Settings as SettingsIcon,
  Smartphone,
  Users,
  CreditCard,
  Shield,
  Globe,
  Bell,
  Palette,
} from "lucide-react";
import { PageHeader } from "@/components/shared";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "general", label: "General", icon: Globe, path: "/settings" },
  { id: "inboxes", label: "Inboxes", icon: Smartphone, path: "/settings/inboxes" },
  { id: "team", label: "Team", icon: Users, path: "/settings/team" },
  { id: "billing", label: "Billing", icon: CreditCard, path: "/settings/billing" },
  { id: "notifications", label: "Notifications", icon: Bell, path: "/settings/notifications" },
  { id: "security", label: "Security", icon: Shield, path: "/settings/security" },
  { id: "appearance", label: "Appearance", icon: Palette, path: "/settings/appearance" },
];

export function Settings() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = tabs.find((t) => location.pathname.startsWith(t.path))?.id || "general";

  // Redirect to inboxes if on base settings path
  if (location.pathname === "/settings") {
    navigate({ to: "/settings/inboxes", replace: true });
  }

  return (
    <div className="flex gap-8">
      <aside className="w-64 shrink-0">
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
