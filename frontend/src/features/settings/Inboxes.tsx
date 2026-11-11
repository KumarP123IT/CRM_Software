import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Send,
  Plus,
  AlertCircle,
  Shield,
  Zap,
  Trash2,
  MessageSquare,
  Globe,
  SendHorizontal,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmptyState, ListSkeleton, PageHeader } from "@/components/shared";
import { toast } from "sonner";
import { api, type Channel, type ConnectInboxInput, type Inbox } from "@/api";
import { cn } from "@/lib/utils";

const CHANNEL_META: Record<Channel, { label: string; icon: typeof Send; hint: string }> = {
  telegram: {
    label: "Telegram",
    icon: Send,
    hint: "Create a bot with @BotFather and paste its token.",
  },
  web: {
    label: "Web chat",
    icon: Globe,
    hint: "Embed a chat widget on your website. Visitors message you in real time.",
  },
  whatsapp: {
    label: "WhatsApp Business",
    icon: MessageSquare,
    hint: "Connect via Meta Embedded Signup (Cloud API).",
  },
  instagram: { label: "Instagram", icon: MessageSquare, hint: "Coming soon." },
  messenger: { label: "Messenger", icon: MessageSquare, hint: "Coming soon." },
  sms: { label: "SMS", icon: MessageSquare, hint: "Coming soon." },
  email: { label: "Email", icon: MessageSquare, hint: "Coming soon." },
};

const CONNECTABLE: Channel[] = ["telegram", "web", "whatsapp"];

export function Inboxes() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const q = useQuery({
    queryKey: ["inboxes"],
    queryFn: () => api.inboxes.list(),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: { name?: string; autoAssign?: boolean } }) =>
      api.inboxes.update(id, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["inboxes"] }),
    onError: () => toast.error("Failed to update inbox"),
  });

  const disconnect = useMutation({
    mutationFn: (id: string) => api.inboxes.disconnect(id),
    onSuccess: () => {
      toast.success("Channel disconnected");
      void qc.invalidateQueries({ queryKey: ["inboxes"] });
    },
    onError: () => toast.error("Failed to disconnect"),
  });

  const test = useMutation({
    mutationFn: (id: string) => api.inboxes.test(id),
    onSuccess: (r) =>
      r.ok ? toast.success("Channel is healthy") : toast.error(r.detail ?? "Health check failed"),
    onError: () => toast.error("Health check failed"),
  });

  if (q.isPending) return <ListSkeleton />;
  if (q.isError)
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertDescription>Failed to load inboxes. Please try again.</AlertDescription>
      </Alert>
    );

  const { supported, items: inboxes } = q.data;
  const connectable = CONNECTABLE.filter((t) => supported.includes(t));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Channels"
        description="Connect messaging channels to receive and send messages from the inbox."
        actions={
          connectable.length > 0 ? (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="size-4 mr-2" />
              Connect channel
            </Button>
          ) : undefined
        }
      />

      {inboxes.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No channels connected"
          description="Connect Telegram, your website widget, or WhatsApp Business to start messaging customers."
          action={
            connectable.length > 0 ? (
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="size-4 mr-2" />
                Connect channel
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4">
          {inboxes.map((inbox) => (
            <InboxCard
              key={inbox.id}
              inbox={inbox}
              onToggleAutoAssign={(v) => update.mutate({ id: inbox.id, input: { autoAssign: v } })}
              onTest={() => test.mutate(inbox.id)}
              onDisconnect={() => disconnect.mutate(inbox.id)}
            />
          ))}
        </div>
      )}

      <ConnectDialog open={dialogOpen} onOpenChange={setDialogOpen} supported={connectable} />
    </div>
  );
}

function InboxCard({
  inbox,
  onToggleAutoAssign,
  onTest,
  onDisconnect,
}: {
  inbox: Inbox;
  onToggleAutoAssign: (v: boolean) => void;
  onTest: () => void;
  onDisconnect: () => void;
}) {
  const meta = CHANNEL_META[inbox.type];
  const Icon = meta.icon;
  const connected = inbox.status === "connected";
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex size-12 items-center justify-center rounded-full",
              connected ? "bg-success-soft" : "bg-muted",
            )}
          >
            <Icon className={cn("size-6", connected ? "text-success" : "text-muted-foreground")} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{inbox.name}</h3>
              <Badge variant="secondary">{meta.label}</Badge>
              <Badge variant={connected ? "default" : "destructive"}>{inbox.status}</Badge>
            </div>
            {inbox.phoneNumber && (
              <p className="text-sm text-muted-foreground">{inbox.phoneNumber}</p>
            )}
            <div className="flex items-center gap-3 mt-2">
              {inbox.qualityRating && (
                <div className="flex items-center gap-1 text-xs">
                  <Shield className="size-3" />
                  <span className="text-muted-foreground">Quality:</span>
                  <span className="font-medium">{inbox.qualityRating}</span>
                </div>
              )}
              {inbox.messagingTier && (
                <div className="flex items-center gap-1 text-xs">
                  <Zap className="size-3" />
                  <span className="text-muted-foreground">Tier:</span>
                  <span className="font-medium">{inbox.messagingTier}</span>
                </div>
              )}
            </div>
            {!inbox.webhookVerified && (
              <Alert variant="destructive" className="mt-3">
                <AlertCircle className="size-4" />
                <AlertDescription>
                  Webhook not verified. Incoming messages may not be received.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={inbox.autoAssign}
              onCheckedChange={onToggleAutoAssign}
              disabled={!connected}
            />
            <span className="text-sm text-muted-foreground">Auto-assign</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onTest} disabled={!connected}>
            Test
          </Button>
          <Button variant="ghost" size="sm" onClick={onDisconnect}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

/* ---------------- connect dialog ---------------- */

function ConnectDialog({
  open,
  onOpenChange,
  supported,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supported: Channel[];
}) {
  const qc = useQueryClient();
  const [step, setStep] = useState<"pick" | Channel>("pick");
  const [form, setForm] = useState({
    name: "",
    domain: "",
    botToken: "",
    code: "",
    phoneNumberId: "",
    businessAccountId: "",
  });

  const connect = useMutation({
    mutationFn: (input: ConnectInboxInput) => api.inboxes.connect(input),
    onSuccess: (inbox) => {
      toast.success(`${CHANNEL_META[inbox.type].label} connected`);
      void qc.invalidateQueries({ queryKey: ["inboxes"] });
      onOpenChange(false);
      setStep("pick");
      setForm({
        name: "",
        domain: "",
        botToken: "",
        code: "",
        phoneNumberId: "",
        businessAccountId: "",
      });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to connect channel"),
  });

  const submit = () => {
    if (step === "telegram") {
      connect.mutate({
        type: "telegram",
        botToken: form.botToken.trim(),
        ...(form.name.trim() ? { name: form.name.trim() } : {}),
      });
    } else if (step === "web") {
      connect.mutate({
        type: "web",
        name: form.name.trim(),
        ...(form.domain.trim() ? { domain: form.domain.trim() } : {}),
      });
    } else if (step === "whatsapp") {
      connect.mutate({
        type: "whatsapp",
        code: form.code.trim(),
        phoneNumberId: form.phoneNumberId.trim(),
        ...(form.businessAccountId.trim()
          ? { businessAccountId: form.businessAccountId.trim() }
          : {}),
      });
    }
  };

  const canSubmit =
    step === "telegram"
      ? form.botToken.trim().length >= 10
      : step === "web"
        ? form.name.trim().length > 0
        : step === "whatsapp"
          ? form.code.trim().length > 0 && form.phoneNumberId.trim().length > 0
          : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step !== "pick" && (
              <Button
                variant="ghost"
                size="sm"
                className="mr-1 h-7 w-7 p-0"
                onClick={() => setStep("pick")}
              >
                <ChevronLeft className="size-4" />
              </Button>
            )}
            {step === "pick" ? "Connect a channel" : `Connect ${CHANNEL_META[step].label}`}
          </DialogTitle>
          <DialogDescription>
            {step === "pick" ? "Choose a messaging channel to connect." : CHANNEL_META[step].hint}
          </DialogDescription>
        </DialogHeader>

        {step === "pick" ? (
          <div className="grid gap-3 py-2">
            {supported.map((type) => {
              const meta = CHANNEL_META[type];
              const Icon = meta.icon;
              return (
                <button
                  key={type}
                  onClick={() => setStep(type)}
                  className="flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-primary-soft/40"
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <Icon className="size-5" />
                  </span>
                  <span>
                    <span className="block font-medium">{meta.label}</span>
                    <span className="block text-sm text-muted-foreground">{meta.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {step === "telegram" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="tg-name">Display name (optional)</Label>
                  <Input
                    id="tg-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Sales support"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tg-token">Bot token</Label>
                  <Input
                    id="tg-token"
                    type="password"
                    value={form.botToken}
                    onChange={(e) => setForm({ ...form, botToken: e.target.value })}
                    placeholder="123456:ABC-DEF…"
                  />
                  <p className="text-xs text-muted-foreground">
                    Message @BotFather on Telegram to create a bot and get a token.
                  </p>
                </div>
              </>
            )}
            {step === "web" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="web-name">Widget name</Label>
                  <Input
                    id="web-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Website chat"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="web-domain">Allowed domain (optional)</Label>
                  <Input
                    id="web-domain"
                    value={form.domain}
                    onChange={(e) => setForm({ ...form, domain: e.target.value })}
                    placeholder="example.com"
                  />
                </div>
              </>
            )}
            {step === "whatsapp" && (
              <>
                <Alert>
                  <AlertCircle className="size-4" />
                  <AlertDescription>
                    Requires Meta app credentials configured on the server. Paste the code and phone
                    number id returned by Embedded Signup.
                  </AlertDescription>
                </Alert>
                <div className="space-y-1.5">
                  <Label htmlFor="wa-code">Signup code</Label>
                  <Input
                    id="wa-code"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="Embedded Signup code"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="wa-pnid">Phone number ID</Label>
                  <Input
                    id="wa-pnid"
                    value={form.phoneNumberId}
                    onChange={(e) => setForm({ ...form, phoneNumberId: e.target.value })}
                    placeholder="From Meta Embedded Signup"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="wa-waba">WhatsApp Business Account ID (optional)</Label>
                  <Input
                    id="wa-waba"
                    value={form.businessAccountId}
                    onChange={(e) => setForm({ ...form, businessAccountId: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {step !== "pick" && (
          <DialogFooter>
            <Button variant="outline" onClick={() => setStep("pick")}>
              Back
            </Button>
            <Button
              onClick={submit}
              disabled={!canSubmit || connect.isPending}
              loading={connect.isPending}
            >
              <SendHorizontal className="size-4 mr-2" />
              Connect
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
