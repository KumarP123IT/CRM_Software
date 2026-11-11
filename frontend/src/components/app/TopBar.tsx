import { Link, useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Bell,
  BookOpen,
  ChevronRight,
  HelpCircle,
  Keyboard,
  LifeBuoy,
  Megaphone,
  Menu,
  Monitor,
  Moon,
  Plus,
  Search,
  Sun,
  Target,
  UserPlus,
  MessageSquarePlus,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Kbd } from "@/components/shared";
import { useUi } from "@/stores/ui";
import { ALL_NAV } from "./nav";
import { SidebarContent } from "./AppSidebar";
import { usePermission } from "@/lib/permissions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const NOTIFS = [
  {
    id: 1,
    text: "Kiara Kumar is waiting for a reply for 12 min",
    time: "2m",
    unread: true,
  },
  {
    id: 2,
    text: "Template “payment_reminder” is under review",
    time: "1h",
    unread: true,
  },
  {
    id: 3,
    text: "“Diwali hampers — VIPs” finished sending",
    time: "2h",
    unread: true,
  },
  { id: 4, text: "Farhan imported 126 contacts", time: "5h", unread: false },
];

function Breadcrumbs() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const item = ALL_NAV.find((n) => pathname.startsWith(n.to));
  const label = item ? t(`nav.${item.key}`) : pathname === "/design" ? "Design system" : "";
  return (
    <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-base sm:flex">
      <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
        Konvo
      </Link>
      {label && (
        <>
          <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden />
          <span className="truncate font-medium text-foreground" aria-current="page">
            {label}
          </span>
        </>
      )}
    </nav>
  );
}

function NewMenu() {
  const broadcast = usePermission("broadcast.create");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="h-9">
          <Plus /> <span className="hidden sm:inline">New</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onSelect={() => toast("New chat is coming soon")}>
          <MessageSquarePlus className="size-4" /> Chat
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast("New contact form is coming soon")}>
          <UserPlus className="size-4" /> Contact
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast("New lead form is coming soon")}>
          <Target className="size-4" /> Lead
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!broadcast.allowed}
          onSelect={() => toast("Broadcast builder is coming soon")}
        >
          <Megaphone className="size-4" /> Broadcast
        </DropdownMenuItem>
        {!broadcast.allowed && (
          <p className="px-2 pb-1.5 text-xs text-muted-foreground">{broadcast.reason}</p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Notifications() {
  const [items, setItems] = useState(NOTIFS);
  const unread = items.filter((n) => n.unread).length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications, ${unread} unread`}
        >
          <Bell className="size-[18px]" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-4 text-destructive-foreground tabular">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="font-display font-semibold">Notifications</span>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0"
            onClick={() => setItems((s) => s.map((n) => ({ ...n, unread: false })))}
          >
            Mark all read
          </Button>
        </div>
        <ul className="max-h-80 overflow-y-auto py-1">
          {items.map((n) => (
            <li key={n.id} className="flex gap-3 px-4 py-2.5 hover:bg-accent">
              <span
                className={cn(
                  "mt-1.5 size-2 shrink-0 rounded-full",
                  n.unread ? "bg-primary" : "bg-transparent",
                )}
                aria-hidden
              />
              <span className="flex-1 text-sm text-foreground">{n.text}</span>
              <span className="text-xs text-muted-foreground">{n.time}</span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useUi();
  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Change theme">
          <Icon className="size-[18px]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => setTheme("light")}>
          <Sun className="size-4" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("dark")}>
          <Moon className="size-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("system")}>
          <Monitor className="size-4" /> Match my device
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TopBar() {
  const { setPaletteOpen, setShortcutsOpen } = useUi();
  const [mobileNav, setMobileNav] = useState(false);
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open menu"
        onClick={() => setMobileNav(true)}
      >
        <Menu className="size-5" />
      </Button>
      <Sheet open={mobileNav} onOpenChange={setMobileNav}>
        <SheetContent side="left" className="w-[280px] bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent collapsed={false} onNavigate={() => setMobileNav(false)} />
        </SheetContent>
      </Sheet>

      <Breadcrumbs />

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => setPaletteOpen(true)}
          className="flex h-9 w-9 items-center gap-2 rounded-md border bg-card px-2.5 text-base text-muted-foreground shadow-soft transition-colors hover:text-foreground sm:w-64 lg:w-80"
          aria-label="Search (Ctrl+K)"
        >
          <Search className="size-4 shrink-0" aria-hidden />
          <span className="hidden flex-1 text-left sm:inline">Search…</span>
          <span className="hidden items-center gap-1 sm:flex">
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>
        <NewMenu />
        <Notifications />
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Help" className="hidden sm:inline-flex">
              <HelpCircle className="size-[18px]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Help</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => setShortcutsOpen(true)}>
              <Keyboard className="size-4" /> Keyboard shortcuts <Kbd className="ml-auto">?</Kbd>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => toast("Guides are coming soon")}>
              <BookOpen className="size-4" /> Guides
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => toast("We'll reply on WhatsApp within an hour")}>
              <LifeBuoy className="size-4" /> Talk to us
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
