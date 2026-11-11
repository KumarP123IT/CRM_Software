import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  BarChart3,
  MessagesSquare,
  TrendingUp,
  Trophy,
  Wallet,
  Users,
  MessageCircle,
} from "lucide-react";
import { api, type Channel } from "@/api";
import { formatINR } from "@/lib/format";
import { PageHeader, EmptyState, ErrorState, ListSkeleton } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const RANGES = [7, 30, 90] as const;

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  pending: "Pending",
  resolved: "Resolved",
  snoozed: "Snoozed",
};

const CHANNEL_LABEL: Record<Channel, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  messenger: "Messenger",
  telegram: "Telegram",
  web: "Web",
  sms: "SMS",
  email: "Email",
};

const STAGE_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

export function Analytics() {
  const [days, setDays] = useState<number>(30);

  const q = useQuery({
    queryKey: ["analytics", "overview", days],
    queryFn: () => api.analytics.overview(days),
  });

  const data = q.data;
  const maxChannelMessages = Math.max(1, ...(data?.channelBreakdown.map((c) => c.messages) ?? [1]));
  const maxStageValue = Math.max(1, ...(data?.leadsByStage.map((s) => s.value) ?? [1]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Messaging volume, pipeline and team performance."
        actions={
          <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RANGES.map((r) => (
                <SelectItem key={r} value={String(r)}>
                  Last {r} days
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {q.isPending ? (
        <ListSkeleton rows={8} />
      ) : q.isError ? (
        <ErrorState onRetry={() => void q.refetch()} />
      ) : !data ? (
        <EmptyState
          icon={BarChart3}
          title="No analytics yet"
          description="Data will appear as conversations and leads come in."
        />
      ) : (
        <>
          {/* headline totals */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            <Metric icon={Users} label="Contacts" value={data.totals.contacts.toLocaleString()} />
            <Metric
              icon={MessageCircle}
              label="Conversations"
              value={data.totals.conversations.toLocaleString()}
            />
            <Metric
              icon={MessagesSquare}
              label={`Messages (${data.days}d)`}
              value={(data.totals.messagesIn + data.totals.messagesOut).toLocaleString()}
            />
            <Metric icon={TrendingUp} label="Leads" value={data.totals.leads.toLocaleString()} />
            <Metric icon={Wallet} label="Won value" value={formatINR(data.totals.wonValue)} />
            <Metric icon={Trophy} label="Top agent" value={data.topAgents[0]?.name ?? "—"} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {/* message volume chart */}
            <Card className="p-5 lg:col-span-2">
              <h2 className="mb-4 text-md font-semibold">Message volume</h2>
              {data.messagesByDay.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No messages in this range.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.messagesByDay}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d: string) => d.slice(5)}
                      tick={{ fontSize: 11 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar
                      dataKey="incoming"
                      name="Incoming"
                      fill="var(--info)"
                      radius={[3, 3, 0, 0]}
                    />
                    <Bar
                      dataKey="outgoing"
                      name="Outgoing"
                      fill="var(--primary)"
                      radius={[3, 3, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            {/* leads by stage */}
            <Card className="p-5">
              <h2 className="mb-4 text-md font-semibold">Pipeline by stage</h2>
              <ul className="space-y-2.5">
                {data.leadsByStage.map((s) => (
                  <li key={s.stage}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="capitalize">{STAGE_LABELS[s.stage] ?? s.stage}</span>
                      <span className="text-muted-foreground">
                        {s.count} · {formatINR(s.value)}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(s.value / maxStageValue) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
                {data.leadsByStage.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">No leads yet.</p>
                )}
              </ul>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {/* channel breakdown */}
            <Card className="p-5">
              <h2 className="mb-4 text-md font-semibold">Channels</h2>
              <ul className="space-y-3">
                {data.channelBreakdown.map((c) => (
                  <li key={c.channel}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{CHANNEL_LABEL[c.channel] ?? c.channel}</span>
                      <span className="text-muted-foreground">
                        {c.conversations} chats · {c.messages} msgs
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-info"
                        style={{ width: `${(c.messages / maxChannelMessages) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
                {data.channelBreakdown.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No conversations yet.
                  </p>
                )}
              </ul>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
              {/* conversations by status */}
              <Card className="p-5">
                <h2 className="mb-4 text-md font-semibold">Conversations</h2>
                <div className="flex flex-wrap gap-2">
                  {data.conversationsByStatus.map((s) => (
                    <Badge key={s.status} variant="secondary" className="px-3 py-1.5 text-xs">
                      {STATUS_LABELS[s.status] ?? s.status}: {s.count}
                    </Badge>
                  ))}
                  {data.conversationsByStatus.length === 0 && (
                    <p className="text-sm text-muted-foreground">No conversations.</p>
                  )}
                </div>
              </Card>

              {/* top agents */}
              <Card className="p-5">
                <h2 className="mb-4 text-md font-semibold">Top agents</h2>
                {data.topAgents.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No replies in this range.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {data.topAgents.map((a, i) => (
                      <li key={a.userId} className="flex items-center gap-3">
                        <span className="flex size-6 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                          {i + 1}
                        </span>
                        <span className="flex-1 text-sm font-medium">{a.name}</span>
                        <span className="text-sm text-muted-foreground">{a.replies} replies</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-xl font-bold tabular">{value}</p>
    </Card>
  );
}
