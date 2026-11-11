import { Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  ChevronsUpDown,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUi } from "@/stores/ui";
import { useAuth, useEffectiveRole } from "@/stores/auth";
import { api } from "@/api";
import { NAV_GROUPS, SETTINGS_ITEM, type NavItem } from "./nav";
import { can, ROLE_LABEL } from "@/lib/permissions";
import { PresenceAvatar } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

function NavLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: (() => void) | undefined;
}) {
  const { t } = useTranslation();
  const label = t(`nav.${item.key}`);
  const link = (
    <Link
      to={item.to}
      onClick={onNavigate}
      className={cn(
        "group flex h-9 items-center gap-3 rounded-md px-2.5 text-base font-medium text-sidebar-foreground transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        collapsed && "justify-center px-0",
      )}
      activeProps={{
        className:
          "bg-sidebar-accent text-sidebar-accent-foreground [&_svg]:text-sidebar-primary",
      }}
    >
      <item.icon
        className="size-[18px] shrink-0 text-muted-foreground transition-colors group-hover:text-sidebar-accent-foreground"
        aria-hidden
      />
      {!collapsed && <span className="truncate">{label}</span>}
      {collapsed && <span className="sr-only">{label}</span>}
    </Link>
  );
  if (!collapsed) return link;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

function WorkspaceSwitcher({ collapsed }: { collapsed: boolean }) {
  const { workspaceId, setWorkspace } = useAuth();
  const { data = [] } = useQuery({
    queryKey: ["workspaces"],
    queryFn: () => api.workspaces.list(),
  });
  const current = data.find((w) => w.id === workspaceId) ?? data[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md p-1.5 text-left transition-colors hover:bg-sidebar-accent",
            collapsed && "justify-center",
          )}
          aria-label="Switch workspace"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary font-display text-sm font-bold text-primary-foreground">
            {current?.name.charAt(0) ?? "K"}
          </span>
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-semibold text-foreground">
                  {current?.name ?? "Loading…"}
                </span>
                {current && (
                  <Badge
                    variant="default"
                    className="mt-0.5 px-1.5 py-0 text-[11px]"
                  >
                    {current.plan}
                  </Badge>
                )}
              </span>
              <ChevronsUpDown
                className="size-4 text-muted-foreground"
                aria-hidden
              />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Workspaces
        </DropdownMenuLabel>
        {data.map((w) => (
          <DropdownMenuItem
            key={w.id}
            onSelect={() => {
              setWorkspace(w.id);
              toast(`Switched to ${w.name}`);
            }}
          >
            <span className="flex size-6 items-center justify-center rounded bg-primary-soft text-xs font-bold text-primary">
              {w.name.charAt(0)}
            </span>
            <span className="flex-1 truncate">{w.name}</span>
            {w.id === current?.id && <Check className="size-4 text-primary" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => toast("Workspace creation is coming soon")}
        >
          <Plus className="size-4" /> Create workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu({ collapsed }: { collapsed: boolean }) {
  const { user, signOut } = useAuth();
  const role = useEffectiveRole();
  const navigate = useNavigate();
  if (!user) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md p-1.5 text-left hover:bg-sidebar-accent",
            collapsed && "justify-center",
          )}
          aria-label="Account menu"
        >
          <PresenceAvatar
            name={user.name}
            tone={user.avatarColor}
            online
            size="sm"
          />
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">
                {user.name}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {ROLE_LABEL[role]}
              </span>
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56">
        <DropdownMenuLabel>
          <span className="block text-sm">{user.name}</span>
          <span className="block text-xs font-normal text-muted-foreground">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate({ to: "/settings" })}>
          <UserRound className="size-4" /> Profile & settings
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            signOut();
            navigate({ to: "/login" });
          }}
        >
          <LogOut className="size-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SidebarContent({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: (() => void) | undefined;
}) {
  const { t } = useTranslation();
  const role = useEffectiveRole();
  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <WorkspaceSwitcher collapsed={collapsed} />
      </div>
      <nav
        aria-label="Main"
        className="flex-1 space-y-5 overflow-y-auto px-3 py-2"
      >
        {NAV_GROUPS.map((g) => {
          const items = g.items.filter((i) => !i.perm || can(role, i.perm));
          if (!items.length) return null;
          return (
            <div key={g.key}>
              {!collapsed ? (
                <p className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                  {t(`nav.${g.key}`)}
                </p>
              ) : (
                <div
                  className="mx-auto mb-2 h-px w-6 bg-sidebar-border"
                  aria-hidden
                />
              )}
              <ul className="space-y-0.5">
                {items.map((i) => (
                  <li key={i.key}>
                    <NavLink
                      item={i}
                      collapsed={collapsed}
                      onNavigate={onNavigate}
                    />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-sidebar-border p-3">
        <NavLink
          item={SETTINGS_ITEM}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
        <UserMenu collapsed={collapsed} />
      </div>
    </div>
  );
}

export function AppSidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUi();
  return (
    <aside
      className={cn(
        "relative hidden shrink-0 border-r border-sidebar-border bg-sidebar transition-[width] duration-200 md:block",
        sidebarCollapsed ? "w-[68px]" : "w-[248px]",
      )}
    >
      <div className="sticky top-0 h-screen">
        <SidebarContent collapsed={sidebarCollapsed} />
        <Button
          variant="secondary"
          size="icon-sm"
          onClick={toggleSidebar}
          className="absolute -right-4 top-16 z-10 size-7 rounded-full"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
      </div>
    </aside>
  );
}
