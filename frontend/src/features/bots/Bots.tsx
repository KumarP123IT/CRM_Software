import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot as BotIcon, Play, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  api,
  type AutomationTrigger,
  type Bot,
  type CreateBotInput,
  type UpdateBotInput,
} from "@/api";
import { cn } from "@/lib/utils";
import { PageHeader, EmptyState, ErrorState, ListSkeleton, Guarded } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TRIGGER_LABEL: Record<AutomationTrigger, string> = {
  first_message: "First message",
  keyword: "Keyword match",
  outside_hours: "Outside business hours",
};

function triggerSummary(b: Bot): string {
  const t = b.trigger;
  if (t.type === "keyword" && t.keywords?.length) return t.keywords.join(", ");
  return TRIGGER_LABEL[t.type];
}

export function Bots() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Bot | "new" | null>(null);

  const q = useQuery({ queryKey: ["bots"], queryFn: () => api.bots.list() });

  const toggle = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api.bots.update(id, { active }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["bots"] }),
    onError: () => toast.error("Couldn't update bot"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.bots.remove(id),
    onSuccess: () => {
      toast.success("Bot deleted");
      void qc.invalidateQueries({ queryKey: ["bots"] });
    },
    onError: () => toast.error("Couldn't delete bot"),
  });

  const bots = q.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bots"
        description="Automation rules that reply to customers automatically."
        actions={
          <Guarded perm="settings.manage">
            <Button onClick={() => setEditing("new")}>
              <Plus className="mr-2 size-4" />
              New bot
            </Button>
          </Guarded>
        }
      />

      {q.isPending ? (
        <ListSkeleton rows={4} />
      ) : q.isError ? (
        <ErrorState onRetry={() => void q.refetch()} />
      ) : bots.length === 0 ? (
        <EmptyState
          icon={BotIcon}
          title="No bots yet"
          description="Create a bot to auto-reply on first messages, keywords, or outside business hours."
          action={
            <Guarded perm="settings.manage">
              <Button onClick={() => setEditing("new")}>
                <Plus className="mr-2 size-4" />
                New bot
              </Button>
            </Guarded>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {bots.map((b) => (
            <Card key={b.id} className={cn("p-5", !b.active && "opacity-60")}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <BotIcon className="size-4" />
                  </span>
                  <div>
                    <p className="font-medium">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{triggerSummary(b)}</p>
                  </div>
                </div>
                <Switch
                  checked={b.active}
                  onCheckedChange={(active) => toggle.mutate({ id: b.id, active })}
                  aria-label={`Toggle ${b.name}`}
                />
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                {b.trigger.response}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Play className="size-3" />
                  {b.runs.toLocaleString()} runs
                </span>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="text-[10px] font-normal">
                    {TRIGGER_LABEL[b.trigger.type]}
                  </Badge>
                  <Guarded perm="settings.manage">
                    <>
                      <button
                        onClick={() => setEditing(b)}
                        className="px-1.5 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove.mutate(b.id)}
                        className="p-1 text-muted-foreground hover:text-destructive"
                        aria-label={`Delete ${b.name}`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </>
                  </Guarded>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <BotDialog bot={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function BotDialog({ bot, onClose }: { bot: Bot | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState(bot?.name ?? "");
  const [type, setType] = useState<AutomationTrigger>(bot?.trigger.type ?? "keyword");
  const [keywords, setKeywords] = useState((bot?.trigger.keywords ?? []).join(", "));
  const [response, setResponse] = useState(bot?.trigger.response ?? "");
  const [active, setActive] = useState(bot?.active ?? true);

  const save = useMutation({
    mutationFn: async () => {
      const kw = keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
      const trigger = {
        type,
        response: response.trim(),
        ...(type === "keyword" ? { keywords: kw } : {}),
      };
      if (bot) {
        const input: UpdateBotInput = { name: name.trim(), trigger, active };
        return api.bots.update(bot.id, input);
      }
      const input: CreateBotInput = { name: name.trim(), trigger, active };
      return api.bots.create(input);
    },
    onSuccess: () => {
      toast.success(bot ? "Bot updated" : "Bot created");
      void qc.invalidateQueries({ queryKey: ["bots"] });
      onClose();
    },
    onError: () => toast.error("Couldn't save bot"),
  });

  const canSubmit =
    name.trim() && response.trim() && (type !== "keyword" || keywords.trim().length > 0);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{bot ? "Edit bot" : "New bot"}</DialogTitle>
          <DialogDescription>Replies automatically when the trigger fires.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="bot-name">Name</Label>
            <Input
              id="bot-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Order status lookup"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Trigger</Label>
            <Select value={type} onValueChange={(v) => setType(v as AutomationTrigger)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TRIGGER_LABEL) as AutomationTrigger[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {TRIGGER_LABEL[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {type === "keyword" && (
            <div className="space-y-1.5">
              <Label htmlFor="bot-keywords">Keywords (comma separated)</Label>
              <Input
                id="bot-keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="status, order, track"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="bot-response">Reply message</Label>
            <Textarea
              id="bot-response"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={4}
              placeholder="What the bot sends…"
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch id="bot-active" checked={active} onCheckedChange={setActive} />
            <Label htmlFor="bot-active">Active</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!canSubmit || save.isPending}
            loading={save.isPending}
            onClick={() => save.mutate()}
          >
            {bot ? "Save" : "Create bot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
