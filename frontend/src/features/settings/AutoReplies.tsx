import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquareReply, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  api,
  type AutoReply,
  type AutomationTrigger,
  type CreateAutoReplyInput,
  type UpdateAutoReplyInput,
} from "@/api";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { ListSkeleton, ErrorState, EmptyState, Guarded } from "@/components/shared";
import { SettingsPage } from "./SettingsPage";

const TRIGGER_LABEL: Record<AutomationTrigger, string> = {
  first_message: "First message",
  keyword: "Keyword",
  outside_hours: "Outside business hours",
};

export function AutoReplies() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<AutoReply | "new" | null>(null);

  const q = useQuery({
    queryKey: ["auto-replies"],
    queryFn: () => api.automation.autoReplies(),
  });

  const toggle = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api.automation.updateAutoReply(id, { active }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["auto-replies"] }),
    onError: () => toast.error("Couldn't update auto-reply"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.automation.removeAutoReply(id),
    onSuccess: () => {
      toast.success("Auto-reply deleted");
      void qc.invalidateQueries({ queryKey: ["auto-replies"] });
    },
    onError: () => toast.error("Couldn't delete auto-reply"),
  });

  const rules = q.data ?? [];

  return (
    <SettingsPage
      title="Auto-Replies"
      description="Messages sent automatically on a customer's first message, when keywords match, or outside business hours."
    >
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-md font-semibold">Rules</h2>
          <Guarded perm="settings.manage">
            <Button size="sm" onClick={() => setEditing("new")}>
              <Plus className="mr-1.5 size-4" />
              New rule
            </Button>
          </Guarded>
        </div>

        {q.isPending ? (
          <ListSkeleton rows={3} />
        ) : q.isError ? (
          <ErrorState onRetry={() => void q.refetch()} />
        ) : rules.length === 0 ? (
          <EmptyState
            icon={MessageSquareReply}
            title="No auto-replies"
            description="Create a rule to answer customers automatically."
            className="py-8"
          />
        ) : (
          <ul className="divide-y">
            {rules.map((r) => (
              <li key={r.id} className="flex items-start gap-3 py-3">
                <Switch
                  checked={r.active}
                  onCheckedChange={(active) => toggle.mutate({ id: r.id, active })}
                  className="mt-1"
                  aria-label={`Toggle ${r.name || "rule"}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{r.name || "Untitled rule"}</span>
                    <Badge variant="secondary" className="text-[10px] font-normal">
                      {TRIGGER_LABEL[r.trigger]}
                    </Badge>
                    {r.trigger === "keyword" && r.keywords.length > 0 && (
                      <span className="text-xs text-muted-foreground">{r.keywords.join(", ")}</span>
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{r.response}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(r)}>
                    Edit
                  </Button>
                  <Guarded perm="settings.manage">
                    <button
                      onClick={() => remove.mutate(r.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive"
                      aria-label="Delete auto-reply"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </Guarded>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {editing && (
        <AutoReplyDialog
          rule={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </SettingsPage>
  );
}

function AutoReplyDialog({ rule, onClose }: { rule: AutoReply | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState(rule?.name ?? "");
  const [trigger, setTrigger] = useState<AutomationTrigger>(rule?.trigger ?? "keyword");
  const [keywords, setKeywords] = useState((rule?.keywords ?? []).join(", "));
  const [response, setResponse] = useState(rule?.response ?? "");
  const [active, setActive] = useState(rule?.active ?? true);

  const save = useMutation({
    mutationFn: async () => {
      const kw = keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
      if (rule) {
        const input: UpdateAutoReplyInput = {
          name: name.trim(),
          trigger,
          keywords: kw,
          response: response.trim(),
          active,
        };
        return api.automation.updateAutoReply(rule.id, input);
      }
      const input: CreateAutoReplyInput = {
        name: name.trim(),
        trigger,
        keywords: kw,
        response: response.trim(),
        active,
      };
      return api.automation.createAutoReply(input);
    },
    onSuccess: () => {
      toast.success(rule ? "Auto-reply updated" : "Auto-reply created");
      void qc.invalidateQueries({ queryKey: ["auto-replies"] });
      onClose();
    },
    onError: () => toast.error("Couldn't save auto-reply"),
  });

  const canSubmit = response.trim() && (trigger !== "keyword" || keywords.trim().length > 0);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{rule ? "Edit auto-reply" : "New auto-reply"}</DialogTitle>
          <DialogDescription>Sent automatically when the trigger matches.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="ar-name">Name (optional)</Label>
            <Input
              id="ar-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pricing question"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Trigger</Label>
            <Select value={trigger} onValueChange={(v) => setTrigger(v as AutomationTrigger)}>
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
          {trigger === "keyword" && (
            <div className="space-y-1.5">
              <Label htmlFor="ar-keywords">Keywords (comma separated)</Label>
              <Input
                id="ar-keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="price, cost, rate"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="ar-response">Reply</Label>
            <Textarea
              id="ar-response"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={4}
              placeholder="Message sent to the customer…"
            />
          </div>
          <div className={cn("flex items-center gap-3")}>
            <Switch id="ar-active" checked={active} onCheckedChange={setActive} />
            <Label htmlFor="ar-active">Active</Label>
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
            {rule ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
