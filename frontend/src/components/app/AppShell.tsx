import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { MessagesSquare, MoreHorizontal, Target, Users, FlaskConical } from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { CommandPalette } from "./CommandPalette";
import { useUi } from "@/stores/ui";
import { useAuth } from "@/stores/auth";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Kbd } from "@/components/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABEL } from "@/lib/permissions";
import type { Role } from "@/api/types";

const SHORTCUTS: [string[], string][] = [
  [["Ctrl", "K"], "Open search"],
  [["/"], "Search"],
  [["j"], "Next item in a list"],
  [["k"], "Previous item in a list"],
  [["Enter"], "Open selected item"],
  [["Esc"], "Close dialog or panel"],
  [["?"], "Show this help"],
];

function isTyping(e: KeyboardEvent) {
  const el = e.target as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
}

function useGlobalShortcuts() {
  const { setPaletteOpen, setShortcutsOpen } = useUi();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(!useUi.getState().paletteOpen);
        return;
      }
      if (isTyping(e)) return;
      if (e.key === "/") {
        e.preventDefault();
        setPaletteOpen(true);
      }
      if (e.key === "?") {
        e.preventDefault();
        setShortcutsOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setPaletteOpen, setShortcutsOpen]);
}

function ShortcutsDialog() {
  const { shortcutsOpen, setShortcutsOpen } = useUi();
  return (
    <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
        </DialogHeader>
        <ul className="divide-y">
          {SHORTCUTS.map(([keys, label]) => (
            <li key={label} className="flex items-center justify-between py-2.5 text-base">
              <span>{label}</span>
              <span className="flex gap-1">
                {keys.map((k) => (
                  <Kbd key={k}>{k}</Kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

function DevRoleSwitcher() {
  const { user, previewRole, setPreviewRole } = useAuth();
  if (!import.meta.env.DEV || !user) return null;
  return (
    <div className="fixed bottom-20 right-3 z-40 flex items-center gap-2 rounded-full border bg-card py-1 pl-3 pr-1 shadow-float md:bottom-4">
      <FlaskConical className="size-3.5 text-warning" aria-hidden />
      <span className="text-xs font-medium text-muted-foreground">View as</span>
      <Select value={previewRole ?? user.role} onValueChange={(v) => setPreviewRole(v as Role)}>
        <SelectTrigger className="h-7 w-28 rounded-full text-xs" aria-label="Preview role">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
            <SelectItem key={r} value={r}>
              {ROLE_LABEL[r]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function MobileTabBar({ onMore }: { onMore: () => void }) {
  const { t } = useTranslation();
  const tabs = [
    {
      to: "/conversations" as const,
      icon: MessagesSquare,
      label: t("nav.inbox"),
    },
    { to: "/contacts" as const, icon: Users, label: t("nav.contacts") },
    { to: "/leads" as const, icon: Target, label: t("nav.leads") },
  ];
  return (
    <nav
      aria-label="Quick"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      {tabs.map((tb) => (
        <Link
          key={tb.to}
          to={tb.to}
          className="flex h-14 flex-col items-center justify-center gap-0.5 text-xs text-muted-foreground"
          activeProps={{ className: "text-primary" }}
        >
          <tb.icon className="size-5" aria-hidden />
          {tb.label}
        </Link>
      ))}
      <button
        onClick={onMore}
        className="flex h-14 flex-col items-center justify-center gap-0.5 text-xs text-muted-foreground"
      >
        <MoreHorizontal className="size-5" aria-hidden />
        {t("nav.more")}
      </button>
    </nav>
  );
}

export function AppShell() {
  useGlobalShortcuts();
  const { setPaletteOpen } = useUi();
  return (
    <div className="flex min-h-screen bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main
          id="main"
          className="mx-auto w-full max-w-[1400px] flex-1 px-4 pb-24 pt-6 sm:px-6 md:pb-10 lg:px-8"
        >
          <Outlet />
        </main>
      </div>
      <MobileTabBar onMore={() => setPaletteOpen(true)} />
      <CommandPalette />
      <ShortcutsDialog />
      <DevRoleSwitcher />
    </div>
  );
}
