import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Check,
  CheckCheck,
  Clock,
  Inbox as InboxIcon,
  MessageSquare,
  NotebookPen,
  Search,
  Send,
  UserPlus,
  Zap,
} from "lucide-react";
import {
  api,
  type Channel,
  type Conversation,
  type ConversationStatus,
  type InboxTab,
  type Message,
} from "@/api";
import { useAuth } from "@/stores/auth";
import { usePermission } from "@/lib/permissions";
import { timeAgo, timeOfDay, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  PageHeader,
  EmptyState,
  ErrorState,
  ListSkeleton,
  PresenceAvatar,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const CHANNEL_LABEL: Record<Channel, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  messenger: "Messenger",
  telegram: "Telegram",
  web: "Web",
  sms: "SMS",
  email: "Email",
};

const TABS: { id: InboxTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "mine", label: "Mine" },
  { id: "unassigned", label: "Unassigned" },
];

const STATUSES: ConversationStatus[] = ["open", "pending", "resolved"];

export function Inbox() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<InboxTab>("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ConversationStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const listQuery = useQuery({
    queryKey: ["conversations", "list", { tab, search, statusFilter, page }],
    queryFn: () =>
      api.conversations.list({
        tab,
        search: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        page,
        pageSize: 30,
        viewerId: user?.id,
      }),
  });

  const items = listQuery.data?.items ?? [];
  const total = listQuery.data?.total ?? 0;
  const pageSize = listQuery.data?.pageSize ?? 30;

  // Keep a valid selection: first item by default, fall back when it disappears.
  useEffect(() => {
    if (items.length === 0) {
      if (selectedId) setSelectedId(null);
      return;
    }
    if (!selectedId || !items.some((c) => c.id === selectedId)) {
      setSelectedId(items[0]!.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // Realtime: invalidate on inbound/outbound message events.
  useEffect(() => {
    return api.conversations.subscribe((event) => {
      if (event.type !== "message") return;
      void qc.invalidateQueries({ queryKey: ["conversations"] });
      void qc.invalidateQueries({ queryKey: ["conversation-messages", event.conversationId] });
      void qc.invalidateQueries({ queryKey: ["conversation", event.conversationId] });
    });
  }, [qc]);

  return (
    <div className="space-y-4">
      <PageHeader title="Inbox" description="Every conversation across your connected channels." />
      <div className="grid gap-4 lg:grid-cols-[minmax(280px,360px)_1fr]">
        <ConversationList
          items={items}
          total={total}
          page={page}
          pageSize={pageSize}
          onPage={setPage}
          tab={tab}
          onTab={(t) => {
            setTab(t);
            setPage(1);
          }}
          search={search}
          onSearch={(s) => {
            setSearch(s);
            setPage(1);
          }}
          statusFilter={statusFilter}
          onStatusFilter={(s) => {
            setStatusFilter(s);
            setPage(1);
          }}
          selectedId={selectedId}
          onSelect={setSelectedId}
          loading={listQuery.isPending}
          error={listQuery.isError}
          onRetry={() => void listQuery.refetch()}
        />
        <ThreadPane conversationId={selectedId} />
      </div>
    </div>
  );
}

/* ---------------- conversation list ---------------- */

function ConversationList({
  items,
  total,
  page,
  pageSize,
  onPage,
  tab,
  onTab,
  search,
  onSearch,
  statusFilter,
  onStatusFilter,
  selectedId,
  onSelect,
  loading,
  error,
  onRetry,
}: {
  items: Conversation[];
  total: number;
  page: number;
  pageSize: number;
  onPage: (p: number) => void;
  tab: InboxTab;
  onTab: (t: InboxTab) => void;
  search: string;
  onSearch: (s: string) => void;
  statusFilter: "all" | ConversationStatus;
  onStatusFilter: (s: "all" | ConversationStatus) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <Card className="flex h-[70vh] min-h-[420px] flex-col overflow-hidden">
      <div className="space-y-2 border-b p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search conversations…"
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => onTab(t.id)}
              className={cn(
                "rounded-md px-2.5 py-1 text-sm font-medium transition-colors",
                tab === t.id
                  ? "bg-primary-soft text-primary"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {t.label}
            </button>
          ))}
          <div className="ml-auto">
            <Select
              value={statusFilter}
              onValueChange={(v) => onStatusFilter(v as "all" | ConversationStatus)}
            >
              <SelectTrigger className="h-8 w-[110px] text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-3">
            <ListSkeleton rows={6} />
          </div>
        ) : error ? (
          <ErrorState onRetry={onRetry} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={InboxIcon}
            title="No conversations"
            description="Messages from your connected channels will appear here."
            className="py-10"
          />
        ) : (
          <ul className="divide-y">
            {items.map((c) => (
              <ConversationRow
                key={c.id}
                convo={c}
                active={c.id === selectedId}
                onClick={() => onSelect(c.id)}
              />
            ))}
          </ul>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between border-t px-3 py-2 text-sm text-muted-foreground">
          <span>
            Page {page} of {pages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPage(page - 1)}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pages}
              onClick={() => onPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function ConversationRow({
  convo,
  active,
  onClick,
}: {
  convo: Conversation;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={cn(
          "flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/60",
          active && "bg-primary-soft/60",
        )}
      >
        <PresenceAvatar name={convo.contactName} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span
              className={cn("truncate text-sm", convo.unread > 0 ? "font-semibold" : "font-medium")}
            >
              {convo.contactName}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {timeAgo(convo.lastMessageAt)}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5">
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-normal">
              {CHANNEL_LABEL[convo.channel] ?? convo.channel}
            </Badge>
            {convo.status !== "open" && (
              <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-normal capitalize">
                {convo.status}
              </Badge>
            )}
          </div>
          <p
            className={cn(
              "mt-1 truncate text-sm",
              convo.unread > 0 ? "font-medium text-foreground" : "text-muted-foreground",
            )}
          >
            {convo.lastMessage}
          </p>
        </div>
        {convo.unread > 0 && (
          <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {convo.unread > 9 ? "9+" : convo.unread}
          </span>
        )}
      </button>
    </li>
  );
}

/* ---------------- thread pane ---------------- */

function ThreadPane({ conversationId }: { conversationId: string | null }) {
  const qc = useQueryClient();
  const { allowed: canReply } = usePermission("conversation.reply");
  const { allowed: canAssign } = usePermission("conversation.assign");

  const convoQuery = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => api.conversations.get(conversationId!),
    enabled: !!conversationId,
  });
  const messagesQuery = useQuery({
    queryKey: ["conversation-messages", conversationId],
    queryFn: () => api.conversations.messages(conversationId!),
    enabled: !!conversationId,
  });
  const teamQuery = useQuery({ queryKey: ["team-members"], queryFn: () => api.team.list() });
  const quickRepliesQuery = useQuery({
    queryKey: ["quick-replies"],
    queryFn: () => api.conversations.quickReplies(),
  });

  const convo = convoQuery.data;
  const messages = useMemo(() => messagesQuery.data ?? [], [messagesQuery.data]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Mark read when a conversation is opened.
  const markRead = useMutation({
    mutationFn: (id: string) => api.conversations.markRead(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["conversations"] }),
  });
  useEffect(() => {
    if (conversationId && convo && convo.unread > 0) markRead.mutate(conversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, convo?.unread]);

  // Scroll to bottom on new messages.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, conversationId]);

  const assign = useMutation({
    mutationFn: ({ id, assigneeId }: { id: string; assigneeId: string | null }) =>
      api.conversations.assign(id, assigneeId),
    onSuccess: (c) => {
      qc.setQueryData(["conversation", c.id], c);
      void qc.invalidateQueries({ queryKey: ["conversations"] });
      toast.success(c.assigneeId ? "Conversation assigned" : "Conversation unassigned");
    },
    onError: () => toast.error("Failed to assign"),
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ConversationStatus }) =>
      api.conversations.setStatus(id, status),
    onSuccess: (c) => {
      qc.setQueryData(["conversation", c.id], c);
      void qc.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: () => toast.error("Failed to update status"),
  });

  const snooze = useMutation({
    mutationFn: ({ id, until }: { id: string; until: string }) =>
      api.conversations.snooze(id, until),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["conversation", conversationId] });
      void qc.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Conversation snoozed for 1 hour");
    },
    onError: () => toast.error("Failed to snooze"),
  });

  if (!conversationId) {
    return (
      <Card className="flex h-[70vh] min-h-[420px] items-center justify-center">
        <EmptyState
          icon={MessageSquare}
          title="Select a conversation"
          description="Pick a chat from the list to read and reply."
        />
      </Card>
    );
  }
  if (convoQuery.isPending || messagesQuery.isPending) {
    return (
      <Card className="flex h-[70vh] min-h-[420px] items-center justify-center">
        <ListSkeleton rows={5} />
      </Card>
    );
  }
  if (convoQuery.isError || !convo) {
    return (
      <Card className="flex h-[70vh] min-h-[420px] items-center justify-center">
        <ErrorState onRetry={() => void convoQuery.refetch()} />
      </Card>
    );
  }

  const windowClosed =
    convo.channel === "whatsapp" &&
    convo.windowClosesAt !== undefined &&
    new Date(convo.windowClosesAt).getTime() < Date.now();
  const members = teamQuery.data ?? [];
  const memberName = (id?: string) => members.find((m) => m.id === id)?.name;

  return (
    <Card className="flex h-[70vh] min-h-[420px] flex-col overflow-hidden">
      {/* header */}
      <div className="flex flex-wrap items-center gap-3 border-b px-4 py-3">
        <PresenceAvatar name={convo.contactName} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate font-semibold">{convo.contactName}</h2>
            <Badge variant="secondary" className="text-[10px] font-normal">
              {CHANNEL_LABEL[convo.channel] ?? convo.channel}
            </Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {convo.assigneeId
              ? `Assigned to ${memberName(convo.assigneeId) ?? "a teammate"}`
              : "Unassigned"}
            {convo.snoozedUntil ? ` · snoozed until ${timeOfDay(convo.snoozedUntil)}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus.mutate({ id: convo.id, status: s })}
              className={cn(
                "rounded-md border px-2 py-1 text-xs font-medium capitalize transition-colors",
                convo.status === s
                  ? "border-primary bg-primary-soft text-primary"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {canAssign && (
          <Select
            value={convo.assigneeId ?? "unassigned"}
            onValueChange={(v) =>
              assign.mutate({ id: convo.id, assigneeId: v === "unassigned" ? null : v })
            }
          >
            <SelectTrigger className="h-8 w-[150px] text-xs">
              <UserPlus className="mr-1 size-3.5" />
              <SelectValue placeholder="Assign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            snooze.mutate({
              id: convo.id,
              until: new Date(Date.now() + 3600_000).toISOString(),
            })
          }
        >
          <Clock className="size-3.5" />
          Snooze 1h
        </Button>
      </div>

      {windowClosed && (
        <div className="flex items-center gap-2 border-b bg-warning-soft px-4 py-2 text-sm text-warning">
          <AlertCircle className="size-4" />
          The 24-hour messaging window has closed — only approved template messages can be sent.
        </div>
      )}

      {/* messages */}
      <div className="flex-1 space-y-3 overflow-y-auto bg-muted/30 px-4 py-4">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No messages yet.</p>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
        <div ref={bottomRef} />
      </div>

      <Composer
        conversationId={convo.id}
        disabled={!canReply}
        quickReplies={quickRepliesQuery.data ?? []}
        windowClosed={windowClosed}
      />
    </Card>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isOut = message.direction === "out";
  const isNote = message.kind === "note";
  return (
    <div className={cn("flex", isOut ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
          isNote
            ? "border border-warning/40 bg-warning-soft text-foreground"
            : isOut
              ? "bg-primary text-primary-foreground"
              : "bg-card text-foreground",
        )}
      >
        {isNote && (
          <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-warning">
            <NotebookPen className="size-3" /> Internal note
          </div>
        )}
        {message.fileName && (
          <div className="mb-1 flex items-center gap-1 text-xs opacity-80">
            <Zap className="size-3" /> {message.fileName}
          </div>
        )}
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
        <div
          className={cn(
            "mt-1 flex items-center justify-end gap-1 text-[10px]",
            isOut ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          {timeOfDay(message.sentAt)}
          {isOut && !isNote && (
            <DeliveryTicks status={message.status} failReason={message.failReason} />
          )}
        </div>
      </div>
    </div>
  );
}

function DeliveryTicks({
  status,
  failReason,
}: {
  status?: Message["status"];
  failReason?: string | undefined;
}) {
  if (status === "failed") {
    return (
      <span title={failReason ?? "Failed"} className="text-destructive">
        <AlertCircle className="size-3" />
      </span>
    );
  }
  if (status === "read") return <CheckCheck className="size-3 text-info" />;
  if (status === "delivered") return <CheckCheck className="size-3" />;
  return <Check className="size-3" />;
}

/* ---------------- composer ---------------- */

function Composer({
  conversationId,
  disabled,
  quickReplies,
  windowClosed,
}: {
  conversationId: string;
  disabled: boolean;
  quickReplies: { id: string; shortcut: string; body: string }[];
  windowClosed: boolean;
}) {
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const [noteMode, setNoteMode] = useState(false);

  const send = useMutation({
    mutationFn: () =>
      api.conversations.send(conversationId, {
        kind: noteMode ? "note" : "text",
        body: body.trim(),
      }),
    onSuccess: () => {
      setBody("");
      void qc.invalidateQueries({ queryKey: ["conversation-messages", conversationId] });
      void qc.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: () => toast.error("Message failed to send"),
  });

  const submit = () => {
    if (!body.trim() || send.isPending) return;
    send.mutate();
  };

  return (
    <div className="border-t p-3">
      {noteMode && (
        <p className="mb-2 flex items-center gap-1.5 text-xs text-warning">
          <NotebookPen className="size-3.5" /> This will be saved as an internal note — the customer
          won't see it.
        </p>
      )}
      <div className="flex items-end gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={
            disabled
              ? "You don't have permission to reply"
              : noteMode
                ? "Write an internal note…"
                : windowClosed
                  ? "Messaging window closed…"
                  : "Type a message…"
          }
          className="min-h-[44px] flex-1 resize-none"
          disabled={disabled || send.isPending}
          rows={1}
        />
        {quickReplies.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={disabled}>
                <Zap className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {quickReplies.map((qr) => (
                <DropdownMenuItem
                  key={qr.id}
                  onSelect={() => setBody(qr.body)}
                  className="flex flex-col items-start gap-0.5"
                >
                  <span className="text-xs font-medium text-primary">/{qr.shortcut}</span>
                  <span className="line-clamp-2 text-xs text-muted-foreground">{qr.body}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Button
          variant={noteMode ? "secondary" : "outline"}
          size="sm"
          onClick={() => setNoteMode((v) => !v)}
          disabled={disabled}
          title="Internal note"
        >
          <NotebookPen className="size-4" />
        </Button>
        <Button size="sm" onClick={submit} disabled={disabled || !body.trim() || send.isPending}>
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
