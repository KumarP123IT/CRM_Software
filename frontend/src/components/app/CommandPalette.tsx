import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Megaphone,
  MessageSquare,
  Moon,
  Sun,
  UserPlus,
  Target,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useUi } from "@/stores/ui";
import { api } from "@/api";
import { ALL_NAV } from "./nav";
import { PresenceAvatar } from "@/components/shared";
import { toast } from "sonner";

export function CommandPalette() {
  const { paletteOpen, setPaletteOpen, setTheme } = useUi();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: contacts } = useQuery({
    queryKey: ["contacts", { all: true }],
    queryFn: () => api.contacts.list({ pageSize: 100 }),
    enabled: paletteOpen,
  });
  const { data: convos } = useQuery({
    queryKey: ["conversations", {}],
    queryFn: () => api.conversations.list({}),
    enabled: paletteOpen,
  });

  const go = (fn: () => void) => {
    setPaletteOpen(false);
    fn();
  };

  return (
    <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen}>
      <CommandInput placeholder="Search people, chats, pages or actions…" />
      <CommandList>
        <CommandEmpty>
          Nothing matches that. Try a name or phone number.
        </CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => go(() => toast("New contact form is coming soon"))}
          >
            <UserPlus /> Add a contact
          </CommandItem>
          <CommandItem
            onSelect={() => go(() => navigate({ to: "/broadcasts" }))}
          >
            <Megaphone /> Send a broadcast
          </CommandItem>
          <CommandItem onSelect={() => go(() => navigate({ to: "/leads" }))}>
            <Target /> Add a lead
          </CommandItem>
          <CommandItem onSelect={() => go(() => setTheme("dark"))}>
            <Moon /> Switch to dark theme
          </CommandItem>
          <CommandItem onSelect={() => go(() => setTheme("light"))}>
            <Sun /> Switch to light theme
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Pages">
          {ALL_NAV.map((n) => (
            <CommandItem
              key={n.key}
              onSelect={() => go(() => navigate({ to: n.to }))}
            >
              <n.icon /> {t(`nav.${n.key}`)}
            </CommandItem>
          ))}
        </CommandGroup>
        {convos && (
          <CommandGroup heading="Conversations">
            {convos.items.map((c) => (
              <CommandItem
                key={c.id}
                value={`chat ${c.contactName} ${c.lastMessage}`}
                onSelect={() => go(() => navigate({ to: "/conversations" }))}
              >
                <MessageSquare />
                <span className="truncate">
                  <span className="font-medium">{c.contactName}</span>{" "}
                  <span className="text-muted-foreground">
                    — {c.lastMessage}
                  </span>
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {contacts && (
          <CommandGroup heading="Contacts">
            {contacts.items.map((c) => (
              <CommandItem
                key={c.id}
                value={`${c.name} ${c.phone}`}
                onSelect={() => go(() => navigate({ to: "/contacts" }))}
              >
                <PresenceAvatar name={c.name} size="sm" />
                <span className="flex-1 truncate">{c.name}</span>
                <span className="text-xs tabular text-muted-foreground">
                  {c.phone}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
