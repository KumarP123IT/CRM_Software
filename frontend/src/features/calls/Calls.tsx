import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PhoneCall, PhoneIncoming, PhoneOutgoing, Plus, Trash2 } from "lucide-react";
import { api, type CallDirection, type CallLog, type CallReminder } from "@/api";
import { formatINR, timeOfDay, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PageHeader, EmptyState, ErrorState, ListSkeleton } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { toast } from "sonner";

function formatDuration(sec?: number) {
  if (sec === undefined) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function Calls() {
  const qc = useQueryClient();
  const [logOpen, setLogOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);

  const logsQuery = useQuery({
    queryKey: ["call-logs"],
    queryFn: () => api.calls.logs({ pageSize: 50 }),
  });
  const remindersQuery = useQuery({
    queryKey: ["call-reminders", "all"],
    queryFn: () => api.calls.reminders({ includeDone: true }),
  });

  const toggleReminder = useMutation({
    mutationFn: ({ id, done }: { id: string; done: boolean }) =>
      api.calls.updateReminder(id, { done }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["call-reminders"] }),
    onError: () => toast.error("Failed to update reminder"),
  });

  const removeReminder = useMutation({
    mutationFn: (id: string) => api.calls.removeReminder(id),
    onSuccess: () => {
      toast.success("Reminder deleted");
      void qc.invalidateQueries({ queryKey: ["call-reminders"] });
    },
  });

  const removeLog = useMutation({
    mutationFn: (id: string) => api.calls.removeLog(id),
    onSuccess: () => {
      toast.success("Call log deleted");
      void qc.invalidateQueries({ queryKey: ["call-logs"] });
    },
  });

  const reminders = remindersQuery.data ?? [];
  const pending = reminders.filter((r) => !r.done);
  const done = reminders.filter((r) => r.done);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calls"
        description="Call reminders and history."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setReminderOpen(true)}>
              <Plus className="size-4 mr-2" />
              Reminder
            </Button>
            <Button onClick={() => setLogOpen(true)}>
              <Plus className="size-4 mr-2" />
              Log call
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* reminders */}
        <Card className="p-5">
          <h2 className="mb-4 text-md font-semibold">
            Reminders{" "}
            {pending.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px]">
                {pending.length} pending
              </Badge>
            )}
          </h2>
          {remindersQuery.isPending ? (
            <ListSkeleton rows={3} />
          ) : remindersQuery.isError ? (
            <ErrorState onRetry={() => void remindersQuery.refetch()} />
          ) : reminders.length === 0 ? (
            <EmptyState
              icon={PhoneCall}
              title="No reminders"
              description="Schedule a call reminder and it will show up here and on the dashboard."
              className="py-8"
            />
          ) : (
            <ul className="space-y-2">
              {[...pending, ...done].map((r) => (
                <ReminderRow
                  key={r.id}
                  reminder={r}
                  onToggle={(done) => toggleReminder.mutate({ id: r.id, done })}
                  onDelete={() => removeReminder.mutate(r.id)}
                />
              ))}
            </ul>
          )}
        </Card>

        {/* call logs */}
        <Card className="p-5">
          <h2 className="mb-4 text-md font-semibold">History</h2>
          {logsQuery.isPending ? (
            <ListSkeleton rows={4} />
          ) : logsQuery.isError ? (
            <ErrorState onRetry={() => void logsQuery.refetch()} />
          ) : (logsQuery.data?.items.length ?? 0) === 0 ? (
            <EmptyState
              icon={PhoneCall}
              title="No calls logged"
              description="Log a call to keep track of conversations that happened off-chat."
              className="py-8"
            />
          ) : (
            <ul className="divide-y">
              {(logsQuery.data?.items ?? []).map((l) => (
                <CallLogRow key={l.id} log={l} onDelete={() => removeLog.mutate(l.id)} />
              ))}
            </ul>
          )}
        </Card>
      </div>

      <LogCallDialog open={logOpen} onOpenChange={setLogOpen} />
      <ReminderDialog open={reminderOpen} onOpenChange={setReminderOpen} />
    </div>
  );
}

function ReminderRow({
  reminder,
  onToggle,
  onDelete,
}: {
  reminder: CallReminder;
  onToggle: (done: boolean) => void;
  onDelete: () => void;
}) {
  const overdue = !reminder.done && new Date(reminder.at).getTime() < Date.now();
  return (
    <li
      className={cn("flex items-start gap-3 rounded-md border p-3", reminder.done && "opacity-60")}
    >
      <Checkbox
        checked={reminder.done ?? false}
        onCheckedChange={(v) => onToggle(v === true)}
        className="mt-1"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={cn("font-medium", reminder.done && "line-through")}>
            {reminder.contactName}
          </span>
          <span
            className={cn(
              "text-sm font-medium tabular",
              overdue ? "text-destructive" : "text-primary",
            )}
          >
            {timeOfDay(reminder.at)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{reminder.phone}</p>
        {reminder.note && <p className="mt-0.5 text-sm text-muted-foreground">{reminder.note}</p>}
        {overdue && <p className="mt-1 text-xs text-destructive">Overdue</p>}
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-[10px] text-muted-foreground">{timeAgo(reminder.at)}</span>
        <button
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive"
          aria-label="Delete reminder"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </li>
  );
}

function CallLogRow({ log, onDelete }: { log: CallLog; onDelete: () => void }) {
  const Icon = log.direction === "inbound" ? PhoneIncoming : PhoneOutgoing;
  return (
    <li className="flex items-center gap-3 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{log.contactName ?? log.phone}</span>
          {log.direction && (
            <Badge variant="secondary" className="text-[10px] font-normal capitalize">
              {log.direction}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {log.phone} · {formatDuration(log.durationSec)} · {timeAgo(log.at)}
        </p>
        {log.note && <p className="mt-0.5 truncate text-sm text-muted-foreground">{log.note}</p>}
      </div>
      <button
        onClick={onDelete}
        className="text-muted-foreground hover:text-destructive"
        aria-label="Delete call log"
      >
        <Trash2 className="size-3.5" />
      </button>
    </li>
  );
}

function toLocalInput(iso?: string) {
  const d = iso ? new Date(iso) : new Date(Date.now() + 3600_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function LogCallDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const qc = useQueryClient();
  const [phone, setPhone] = useState("");
  const [direction, setDirection] = useState<CallDirection>("outbound");
  const [durationMin, setDurationMin] = useState("");
  const [note, setNote] = useState("");
  const [at, setAt] = useState(toLocalInput());

  const create = useMutation({
    mutationFn: () =>
      api.calls.log({
        phone: phone.trim(),
        direction,
        ...(durationMin ? { durationSec: Math.round(Number(durationMin) * 60) } : {}),
        ...(note.trim() ? { note: note.trim() } : {}),
        at: new Date(at).toISOString(),
      }),
    onSuccess: () => {
      toast.success("Call logged");
      void qc.invalidateQueries({ queryKey: ["call-logs"] });
      onOpenChange(false);
      setPhone("");
      setNote("");
      setDurationMin("");
    },
    onError: () => toast.error("Failed to log call"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log a call</DialogTitle>
          <DialogDescription>Record a call that happened outside the inbox.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="call-phone">Phone number</Label>
            <Input
              id="call-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 …"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Direction</Label>
              <Select value={direction} onValueChange={(v) => setDirection(v as CallDirection)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outbound">Outbound</SelectItem>
                  <SelectItem value="inbound">Inbound</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="call-dur">Duration (min)</Label>
              <Input
                id="call-dur"
                type="number"
                min={0}
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="call-at">When</Label>
            <Input
              id="call-at"
              type="datetime-local"
              value={at}
              onChange={(e) => setAt(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="call-note">Note</Label>
            <Textarea
              id="call-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What was discussed?"
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!phone.trim() || create.isPending}
            loading={create.isPending}
            onClick={() => create.mutate()}
          >
            Log call
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReminderDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const qc = useQueryClient();
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [at, setAt] = useState(toLocalInput());

  const create = useMutation({
    mutationFn: () =>
      api.calls.addReminder({
        contactName: contactName.trim(),
        phone: phone.trim(),
        ...(note.trim() ? { note: note.trim() } : {}),
        at: new Date(at).toISOString(),
      }),
    onSuccess: () => {
      toast.success("Reminder set");
      void qc.invalidateQueries({ queryKey: ["call-reminders"] });
      onOpenChange(false);
      setContactName("");
      setPhone("");
      setNote("");
    },
    onError: () => toast.error("Failed to set reminder"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Call reminder</DialogTitle>
          <DialogDescription>Get reminded to call someone at a set time.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="rem-name">Contact name</Label>
            <Input
              id="rem-name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g. Priya Sharma"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rem-phone">Phone</Label>
            <Input
              id="rem-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 …"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rem-at">When</Label>
              <Input
                id="rem-at"
                type="datetime-local"
                value={at}
                onChange={(e) => setAt(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rem-note">Note</Label>
              <Input
                id="rem-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!contactName.trim() || !phone.trim() || create.isPending}
            loading={create.isPending}
            onClick={() => create.mutate()}
          >
            Set reminder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
