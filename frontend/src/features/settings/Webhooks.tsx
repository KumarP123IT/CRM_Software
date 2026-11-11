import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, KeyRound, Plus, Send, Trash2, Webhook } from "lucide-react";
import { toast } from "sonner";
import {
  api,
  WEBHOOK_EVENT_NAMES,
  type WebhookEndpoint,
  type CreateWebhookEndpointInput,
  type UpdateWebhookEndpointInput,
} from "@/api";
import { cn } from "@/lib/utils";
import { EmptyState, ErrorState, ListSkeleton, Guarded } from "@/components/shared";
import { SettingsPage } from "./SettingsPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const EVENT_LABEL: Record<string, string> = {
  "message.created": "Message created",
  "conversation.created": "Conversation created",
  "conversation.assigned": "Conversation assigned",
  "conversation.status_changed": "Status changed",
  "contact.created": "Contact created",
  "lead.created": "Lead created",
  "broadcast.sent": "Broadcast sent",
};

function eventList(events: string): string[] {
  return events
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

export function Webhooks() {
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [secretFor, setSecretFor] = useState<{ id: string; secret: string } | null>(null);

  const q = useQuery({
    queryKey: ["webhook-endpoints"],
    queryFn: () => api.webhookEndpoints.list(),
  });

  const toggle = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api.webhookEndpoints.update(id, { active }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["webhook-endpoints"] }),
    onError: () => toast.error("Couldn't update webhook"),
  });

  const test = useMutation({
    mutationFn: (id: string) => api.webhookEndpoints.test(id),
    onSuccess: () => toast.success("Test event queued — check deliveries"),
    onError: () => toast.error("Couldn't send test event"),
  });

  const rotate = useMutation({
    mutationFn: (id: string) => api.webhookEndpoints.rotateSecret(id),
    onSuccess: (r, id) => setSecretFor({ id, secret: r.secret }),
    onError: () => toast.error("Couldn't rotate secret"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.webhookEndpoints.remove(id),
    onSuccess: () => {
      toast.success("Webhook deleted");
      void qc.invalidateQueries({ queryKey: ["webhook-endpoints"] });
    },
    onError: () => toast.error("Couldn't delete webhook"),
  });

  const hooks = q.data ?? [];

  return (
    <SettingsPage
      title="Webhooks"
      description="HTTPS endpoints Konvo POSTs signed events to. Failed deliveries retry with backoff."
    >
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-md font-semibold">Endpoints</h2>
          <Guarded perm="settings.manage">
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="mr-1.5 size-4" />
              New webhook
            </Button>
          </Guarded>
        </div>

        {q.isPending ? (
          <ListSkeleton rows={3} />
        ) : q.isError ? (
          <ErrorState onRetry={() => void q.refetch()} />
        ) : hooks.length === 0 ? (
          <EmptyState
            icon={Webhook}
            title="No webhooks"
            description="Add an HTTPS endpoint to receive signed event notifications."
            className="py-8"
            action={
              <Guarded perm="settings.manage">
                <Button size="sm" onClick={() => setCreating(true)}>
                  <Plus className="mr-1.5 size-4" />
                  New webhook
                </Button>
              </Guarded>
            }
          />
        ) : (
          <ul className="divide-y">
            {hooks.map((h) => (
              <WebhookRow
                key={h.id}
                hook={h}
                onToggle={(active) => toggle.mutate({ id: h.id, active })}
                onTest={() => test.mutate(h.id)}
                onRotate={() => rotate.mutate(h.id)}
                onDelete={() => remove.mutate(h.id)}
              />
            ))}
          </ul>
        )}
      </Card>

      {creating && <WebhookDialog onClose={() => setCreating(false)} onSecret={setSecretFor} />}
      {secretFor && <SecretDialog secret={secretFor.secret} onClose={() => setSecretFor(null)} />}
    </SettingsPage>
  );
}

function WebhookRow({
  hook,
  onToggle,
  onTest,
  onRotate,
  onDelete,
}: {
  hook: WebhookEndpoint;
  onToggle: (active: boolean) => void;
  onTest: () => void;
  onRotate: () => void;
  onDelete: () => void;
}) {
  const events = eventList(hook.events);
  return (
    <li className={cn("flex items-start gap-3 py-3", !hook.active && "opacity-60")}>
      <Switch
        checked={hook.active}
        onCheckedChange={onToggle}
        className="mt-1"
        aria-label="Toggle webhook"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-sm">{hook.url}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {events.slice(0, 4).map((e) => (
            <Badge key={e} variant="secondary" className="text-[10px] font-normal">
              {EVENT_LABEL[e] ?? e}
            </Badge>
          ))}
          {events.length > 4 && (
            <Badge variant="secondary" className="text-[10px] font-normal">
              +{events.length - 4}
            </Badge>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {hook.deliveryCount} deliveries · {hook.hasSecret ? "signed" : "unsigned"}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onTest}>
          <Send className="size-3.5" />
        </Button>
        <Guarded perm="settings.manage">
          <>
            <button
              onClick={onRotate}
              className="px-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Rotate
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-muted-foreground hover:text-destructive"
              aria-label="Delete webhook"
            >
              <Trash2 className="size-4" />
            </button>
          </>
        </Guarded>
      </div>
    </li>
  );
}

function WebhookDialog({
  onClose,
  onSecret,
}: {
  onClose: () => void;
  onSecret: (s: { id: string; secret: string }) => void;
}) {
  const qc = useQueryClient();
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>(["message.created"]);

  const create = useMutation({
    mutationFn: () => {
      const input: CreateWebhookEndpointInput = {
        url: url.trim(),
        events,
      };
      return api.webhookEndpoints.create(input);
    },
    onSuccess: (r) => {
      toast.success("Webhook created — save the signing secret");
      onSecret({ id: r.id, secret: r.secret });
      void qc.invalidateQueries({ queryKey: ["webhook-endpoints"] });
      onClose();
    },
    onError: () => toast.error("Couldn't create webhook — URL must be https"),
  });

  const toggleEvent = (e: string, checked: boolean) =>
    setEvents((prev) => (checked ? [...prev, e] : prev.filter((x) => x !== e)));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New webhook</DialogTitle>
          <DialogDescription>
            Events are POSTed as JSON with an <code>X-Konvo-Signature</code> HMAC header.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="wh-url">Endpoint URL</Label>
            <Input
              id="wh-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/hooks/konvo"
            />
          </div>
          <div className="space-y-2">
            <Label>Events</Label>
            <div className="grid grid-cols-2 gap-2">
              {WEBHOOK_EVENT_NAMES.map((e) => (
                <label key={e} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={events.includes(e)}
                    onCheckedChange={(c) => toggleEvent(e, c === true)}
                  />
                  {EVENT_LABEL[e] ?? e}
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!url.trim() || events.length === 0 || create.isPending}
            loading={create.isPending}
            onClick={() => create.mutate()}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SecretDialog({ secret, onClose }: { secret: string; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Signing secret</DialogTitle>
          <DialogDescription>
            Shown once — store it now. Verify <code>X-Konvo-Signature</code> with HMAC-SHA256 of the
            raw request body.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-3">
          <code className="flex-1 break-all font-mono text-xs">{secret}</code>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void navigator.clipboard.writeText(secret).then(
                () => toast.success("Secret copied"),
                () => toast.error("Couldn't copy"),
              );
            }}
          >
            <Copy className="size-4" />
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
