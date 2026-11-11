import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Activity,
  Check,
  Clock,
  MessageCircle,
  MessagesSquare,
  Phone,
  Send,
  UserPlus,
  Users,
  Megaphone,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { api, type ActivityItem, type OnboardingStep } from "@/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  EmptyState,
  ErrorState,
  ListSkeleton,
  PageHeader,
  PresenceAvatar,
  ProgressRing,
  StatCard,
} from "@/components/shared";
import { useAuth, useEffectiveRole } from "@/stores/auth";
import { usePermission } from "@/lib/permissions";
import { formatNumber, timeAgo, timeOfDay } from "@/lib/format";
import { cn } from "@/lib/utils";

const ACTIVITY_ICON: Record<ActivityItem["kind"], typeof Activity> = {
  message: MessageCircle,
  lead: TrendingUp,
  broadcast: Megaphone,
  contact: UserPlus,
  assignment: Users,
};

function greetingKey() {
  const h = new Date().getHours();
  return h < 12
    ? "dashboard.greeting_morning"
    : h < 17
      ? "dashboard.greeting_afternoon"
      : "dashboard.greeting_evening";
}

export function Dashboard() {
  const { t } = useTranslation();
  const user = useAuth((s) => s.user);
  const first = user?.name.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6">
      <PageHeader
        title={t(greetingKey(), { name: first })}
        description={t("dashboard.subtitle")}
      />
      <SetupChecklist />
      <Metrics />
      <div className="grid gap-6 lg:grid-cols-3">
        <AssignedChats userId={user?.id} />
        <CallReminders />
      </div>
      <RecentActivity />
    </div>
  );
}

function SetupChecklist() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["dashboard", "onboarding"],
    queryFn: () => api.dashboard.onboarding(),
  });
  if (q.isPending)
    return (
      <Card className="p-5">
        <ListSkeleton rows={2} />
      </Card>
    );
  if (q.isError)
    return (
      <Card>
        <ErrorState onRetry={() => q.refetch()} />
      </Card>
    );
  const steps = q.data;
  const done = steps.filter((s) => s.done).length;
  if (done === steps.length) return null;
  const markDone = (id: OnboardingStep["id"]) => {
    qc.setQueryData<OnboardingStep[]>(["dashboard", "onboarding"], (old) =>
      old?.map((s) => (s.id === id ? { ...s, done: true } : s)),
    );
    toast.success(`${t(`onboarding.${id}`)} — done`);
  };

  const stepRoutes: Record<OnboardingStep["id"], string> = {
    connect: "/settings",
    import: "/contacts",
    template: "/templates",
    invite: "/settings",
    broadcast: "/broadcasts",
  };

  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <div className="relative">
          <ProgressRing value={(done / steps.length) * 100} />
          <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular">
            {done}/{steps.length}
          </span>
        </div>
        <div>
          <h2 className="text-md font-semibold">{t("onboarding.title")}</h2>
          <p className="text-sm text-muted-foreground">
            Finish these steps to get the most out of your workspace.
          </p>
        </div>
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              disabled={s.done}
              onClick={() => {
                if (!s.done) {
                  navigate({ to: stepRoutes[s.id] });
                } else {
                  markDone(s.id);
                }
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-md border p-3 text-left text-sm transition-colors",
                s.done ? "bg-success-soft text-success" : "hover:bg-muted",
              )}
            >
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border",
                  s.done && "border-success bg-success text-primary-foreground",
                )}
              >
                {s.done && <Check className="size-3" aria-hidden />}
              </span>
              <span className={cn(s.done && "line-through")}>
                {t(`onboarding.${s.id}`)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Metrics() {
  const { can: canViewAnalytics } = usePermission("analytics.view");
  const q = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => api.dashboard.stats(),
  });
  if (q.isError)
    return (
      <Card>
        <ErrorState onRetry={() => q.refetch()} />
      </Card>
    );
  const s = q.data;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        loading={!s}
        label="Open chats"
        icon={MessagesSquare}
        value={s ? formatNumber(s.openConversations.value) : ""}
        delta={s?.openConversations.delta}
        trend={s?.openConversations.trend}
      />
      <StatCard
        loading={!s}
        label="Avg. reply time"
        icon={Clock}
        goodWhenDown
        value={s ? `${s.avgResponseMins.value} min` : ""}
        delta={s?.avgResponseMins.delta}
        trend={s?.avgResponseMins.trend}
      />
      {canViewAnalytics && (
        <>
          <StatCard
            loading={!s}
            label="New leads"
            icon={TrendingUp}
            value={s ? formatNumber(s.newLeads.value) : ""}
            delta={s?.newLeads.delta}
            trend={s?.newLeads.trend}
          />
          <StatCard
            loading={!s}
            label="Messages today"
            icon={Send}
            value={s ? formatNumber(s.messagesToday.value) : ""}
            delta={s?.messagesToday.delta}
            trend={s?.messagesToday.trend}
          />
        </>
      )}
    </div>
  );
}

function AssignedChats({ userId }: { userId?: string | undefined }) {
  const { can: canReply } = usePermission("conversation.reply");
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["conversations", "assigned", userId],
    queryFn: () =>
      api.conversations.list({ assigneeId: userId ?? "u1", pageSize: 6 }),
  });
  const resolve = useMutation({
    mutationFn: (id: string) => api.conversations.setStatus(id, "resolved"),
    onSuccess: () => {
      toast.success("Chat marked as resolved");
      void qc.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: () => toast.error("Couldn't update this chat. Try again."),
  });
  const rows = q.data?.items.filter((c) => c.status !== "resolved") ?? [];
  return (
    <Card className="p-5 lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-md font-semibold">Assigned to you</h2>
        <Button asChild variant="ghost" size="sm">
          <Link to="/conversations">
            View all <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
      {q.isPending ? (
        <ListSkeleton />
      ) : q.isError ? (
        <ErrorState onRetry={() => q.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title="You're all caught up"
          description="No open chats are assigned to you right now."
          className="py-8"
        />
      ) : (
        <ul className="divide-y">
          {rows.map((c) => (
            <li key={c.id} className="flex items-center gap-3 py-3">
              <PresenceAvatar name={c.contactName} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{c.contactName}</span>
                  {c.status === "pending" && (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {timeAgo(c.lastMessageAt)}
                  </span>
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {c.lastMessage}
                </p>
              </div>
              {c.unread > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground tabular">
                  {c.unread}
                </span>
              )}
              {canReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={resolve.isPending}
                  onClick={() => resolve.mutate(c.id)}
                  aria-label={`Resolve chat with ${c.contactName}`}
                >
                  <Check className="size-4" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function CallReminders() {
  const { can: canViewAnalytics } = usePermission("analytics.view");
  const q = useQuery({
    queryKey: ["dashboard", "calls"],
    queryFn: () => api.dashboard.callReminders(),
  });
  const today = new Date().toDateString();
  const rows = (q.data ?? [])
    .filter((r) => new Date(r.at).toDateString() === today)
    .sort((a, b) => a.at.localeCompare(b.at));

  if (!canViewAnalytics) return null;

  return (
    <Card className="p-5">
      <h2 className="mb-4 text-md font-semibold">Today's calls</h2>
      {q.isPending ? (
        <ListSkeleton rows={3} />
      ) : q.isError ? (
        <ErrorState onRetry={() => q.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Phone}
          title="No calls today"
          description="Call reminders you set will show up here."
          className="py-8"
        />
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const past = new Date(r.at) < new Date();
            return (
              <li
                key={r.id}
                className={cn(
                  "rounded-md border p-3",
                  past && "opacity-60 border-destructive/50",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{r.contactName}</span>
                  <span className="text-sm font-medium tabular text-primary">
                    {timeOfDay(r.at)}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{r.note}</p>
                <a
                  href={`tel:${r.phone.replace(/\s/g, "")}`}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <Phone className="size-3.5" aria-hidden /> {r.phone}
                </a>
                {past && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-destructive">
                    <AlertTriangle className="size-3" />
                    Overdue
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function RecentActivity() {
  const q = useQuery({
    queryKey: ["dashboard", "activity"],
    queryFn: () => api.dashboard.activity(),
  });
  return (
    <Card className="p-5">
      <h2 className="mb-4 text-md font-semibold">Recent activity</h2>
      {q.isPending ? (
        <ListSkeleton />
      ) : q.isError ? (
        <ErrorState onRetry={() => q.refetch()} />
      ) : q.data.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No activity yet"
          description="Messages, new leads and broadcasts will appear here."
          className="py-8"
        />
      ) : (
        <ol className="space-y-4">
          {q.data.map((a) => {
            const Icon = ACTIVITY_ICON[a.kind];
            return (
              <li key={a.id} className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{a.actorName}</span> {a.text}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {timeAgo(a.at)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
