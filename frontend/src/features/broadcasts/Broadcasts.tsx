import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Megaphone,
  Plus,
  Search,
  MoreHorizontal,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Users,
  Pause,
  Eye,
  Trash2,
  BarChart3,
  Globe,
  Tag,
} from "lucide-react";
import { api, type Broadcast, type BroadcastRecipient, type Contact, type Template } from "@/api";
import { PageHeader, EmptyState, ErrorState, ListSkeleton, StatCard } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import { format } from "date-fns";

type BroadcastStep = "template" | "audience" | "personalize" | "schedule" | "review";
type AudienceKind = "all" | "opted-in" | "group" | "tag";

interface BroadcastForm {
  name: string;
  templateId: string;
  audienceKind: AudienceKind;
  audienceId: string;
  campaignId?: string | undefined;
  scheduleType: "now" | "later";
  scheduledAt?: string | undefined;
}

const STEPS: { id: BroadcastStep; label: string }[] = [
  { id: "template", label: "Template" },
  { id: "audience", label: "Audience" },
  { id: "personalize", label: "Personalize" },
  { id: "schedule", label: "Schedule" },
  { id: "review", label: "Review" },
];

const STATUS_CONFIG: Record<
  Broadcast["status"],
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
    icon: typeof Clock;
  }
> = {
  draft: { label: "Draft", variant: "secondary", icon: Megaphone },
  scheduled: { label: "Scheduled", variant: "outline", icon: Clock },
  sending: { label: "Sending", variant: "outline", icon: Loader2 },
  sent: { label: "Sent", variant: "default", icon: CheckCircle },
  cancelled: { label: "Cancelled", variant: "secondary", icon: XCircle },
  failed: { label: "Failed", variant: "destructive", icon: AlertCircle },
};

function audienceDescriptor(kind: AudienceKind, id: string): string {
  switch (kind) {
    case "all":
      return "all";
    case "opted-in":
      return "opted-in";
    case "group":
      return `group:${id}`;
    case "tag":
      return `tag:${encodeURIComponent(id)}`;
  }
}

/** Best-effort recipient estimate for the wizard (backend is authoritative). */
function estimateAudience(
  kind: AudienceKind,
  id: string,
  contacts: Contact[],
  contactsTotal: number,
  groups: { id: string; memberCount: number }[],
): { total: number; optedOut: number } {
  const pool =
    kind === "all"
      ? contacts
      : kind === "opted-in"
        ? contacts.filter((c) => c.optedIn)
        : kind === "tag"
          ? contacts.filter((c) => c.tags.includes(id))
          : [];
  const total =
    kind === "all"
      ? contactsTotal
      : kind === "group"
        ? (groups.find((g) => g.id === id)?.memberCount ?? 0)
        : pool.length;
  const optedOut = pool.filter((c) => !c.optedIn).length;
  return { total, optedOut };
}

function sampleContactsFor(kind: AudienceKind, id: string, contacts: Contact[]): Contact[] {
  const pool =
    kind === "all" || kind === "opted-in"
      ? contacts
      : kind === "tag"
        ? contacts.filter((c) => c.tags.includes(id))
        : contacts; // group membership isn't in the contact page — approximate
  return pool.filter((c) => (kind === "opted-in" ? c.optedIn : true)).slice(0, 3);
}

export function Broadcasts() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [resultsBroadcast, setResultsBroadcast] = useState<Broadcast | null>(null);
  const [step, setStep] = useState<BroadcastStep>("template");
  const [form, setForm] = useState<BroadcastForm>({
    name: "",
    templateId: "",
    audienceKind: "all",
    audienceId: "",
    scheduleType: "now",
  });

  const q = useQuery({
    queryKey: ["broadcasts"],
    queryFn: () => api.broadcasts.list(),
  });

  const templatesQ = useQuery({
    queryKey: ["templates"],
    queryFn: () => api.templates.list(),
  });

  const groupsQ = useQuery({ queryKey: ["groups"], queryFn: () => api.groups.list() });
  const tagsQ = useQuery({ queryKey: ["tags"], queryFn: () => api.tags.list() });
  const contactsQ = useQuery({
    queryKey: ["contacts", "broadcast-estimate"],
    queryFn: () => api.contacts.list({ pageSize: 200 }),
  });
  const campaignsQ = useQuery({ queryKey: ["campaigns"], queryFn: () => api.campaigns.list() });

  const filteredBroadcasts =
    q.data?.filter((b) => b.name.toLowerCase().includes(search.toLowerCase())) ?? [];

  const resetWizard = () => {
    setStep("template");
    setForm({
      name: "",
      templateId: "",
      audienceKind: "all",
      audienceId: "",
      scheduleType: "now",
    });
  };

  const handleClose = () => {
    resetWizard();
    setWizardOpen(false);
  };

  const invalidate = () => void qc.invalidateQueries({ queryKey: ["broadcasts"] });
  const onError = (e: unknown) =>
    toast.error(e instanceof Error ? e.message : "Something went wrong");

  const sendBroadcast = useMutation({
    mutationFn: () =>
      api.broadcasts.create({
        name: form.name.trim() || "Untitled broadcast",
        templateId: form.templateId,
        audience: audienceDescriptor(form.audienceKind, form.audienceId),
        ...(form.campaignId ? { campaignId: form.campaignId } : {}),
        ...(form.scheduleType === "later" && form.scheduledAt
          ? { scheduledAt: new Date(form.scheduledAt).toISOString() }
          : {}),
      }),
    onSuccess: (b) => {
      toast.success(b.status === "scheduled" ? "Broadcast scheduled" : "Broadcast queued");
      handleClose();
      invalidate();
    },
    onError,
  });

  const sendNow = useMutation({
    mutationFn: (id: string) => api.broadcasts.send(id),
    onSuccess: () => {
      toast.success("Broadcast sent");
      invalidate();
    },
    onError,
  });

  const cancelBroadcast = useMutation({
    mutationFn: (id: string) => api.broadcasts.cancel(id),
    onSuccess: () => {
      toast.success("Broadcast cancelled");
      invalidate();
    },
    onError,
  });

  const deleteBroadcast = useMutation({
    mutationFn: (id: string) => api.broadcasts.remove(id),
    onSuccess: () => {
      toast.success("Broadcast deleted");
      invalidate();
    },
    onError,
  });

  const contacts = useMemo(() => contactsQ.data?.items ?? [], [contactsQ.data]);
  const estimate = useMemo(
    () =>
      estimateAudience(
        form.audienceKind,
        form.audienceId,
        contacts,
        contactsQ.data?.total ?? contacts.length,
        groupsQ.data ?? [],
      ),
    [form.audienceKind, form.audienceId, contacts, contactsQ.data, groupsQ.data],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Broadcasts"
        description="Send messages to many contacts at once using approved templates."
        actions={
          <Button onClick={() => setWizardOpen(true)}>
            <Plus className="size-4 mr-2" />
            Create broadcast
          </Button>
        }
      />

      <Card className="p-4">
        {/* Search */}
        <div className="relative max-w-sm mb-4">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search broadcasts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
        {q.isPending ? (
          <ListSkeleton rows={4} />
        ) : q.isError ? (
          <ErrorState onRetry={() => q.refetch()} />
        ) : filteredBroadcasts.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No broadcasts yet"
            description="Create a broadcast to send messages to multiple contacts at once."
            action={
              <Button onClick={() => setWizardOpen(true)}>
                <Plus className="size-4 mr-2" />
                Create broadcast
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Delivered</TableHead>
                  <TableHead>Read</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBroadcasts.map((broadcast) => {
                  const config = STATUS_CONFIG[broadcast.status];
                  const StatusIcon = config.icon;
                  return (
                    <TableRow key={broadcast.id}>
                      <TableCell className="font-medium">{broadcast.name}</TableCell>
                      <TableCell>{broadcast.audienceLabel ?? broadcast.audience}</TableCell>
                      <TableCell>
                        <Badge variant={config.variant} className="gap-1">
                          <StatusIcon
                            className={cn(
                              "size-3",
                              broadcast.status === "sending" && "animate-spin",
                            )}
                          />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="tabular">{broadcast.sent}</TableCell>
                      <TableCell className="tabular">{broadcast.delivered}</TableCell>
                      <TableCell className="tabular">{broadcast.read}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {["sent", "sending", "failed", "cancelled"].includes(
                              broadcast.status,
                            ) && (
                              <DropdownMenuItem onClick={() => setResultsBroadcast(broadcast)}>
                                <BarChart3 className="mr-2 size-4" />
                                View results
                              </DropdownMenuItem>
                            )}
                            {(broadcast.status === "draft" || broadcast.status === "scheduled") && (
                              <DropdownMenuItem onClick={() => sendNow.mutate(broadcast.id)}>
                                <Send className="mr-2 size-4" />
                                Send now
                              </DropdownMenuItem>
                            )}
                            {["draft", "scheduled", "sending"].includes(broadcast.status) && (
                              <DropdownMenuItem
                                onClick={() => cancelBroadcast.mutate(broadcast.id)}
                              >
                                <Pause className="mr-2 size-4" />
                                Cancel
                              </DropdownMenuItem>
                            )}
                            {["draft", "scheduled", "cancelled"].includes(broadcast.status) && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => deleteBroadcast.mutate(broadcast.id)}
                                >
                                  <Trash2 className="mr-2 size-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Broadcast Wizard */}
      <BroadcastWizard
        open={wizardOpen}
        onOpenChange={handleClose}
        step={step}
        setStep={setStep}
        form={form}
        setForm={setForm}
        templates={templatesQ.data ?? []}
        groups={groupsQ.data ?? []}
        tags={tagsQ.data ?? []}
        campaigns={campaignsQ.data ?? []}
        sampleContacts={sampleContactsFor(form.audienceKind, form.audienceId, contacts)}
        estimate={estimate}
        sending={sendBroadcast.isPending}
        onSend={() => sendBroadcast.mutate()}
      />

      {/* Results Dialog */}
      <BroadcastResultsDialog
        broadcast={resultsBroadcast}
        open={resultsBroadcast !== null}
        onOpenChange={(open) => {
          if (!open) setResultsBroadcast(null);
        }}
      />
    </div>
  );
}

function BroadcastWizard({
  open,
  onOpenChange,
  step,
  setStep,
  form,
  setForm,
  templates,
  groups,
  tags,
  campaigns,
  sampleContacts,
  estimate,
  sending,
  onSend,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step: BroadcastStep;
  setStep: (step: BroadcastStep) => void;
  form: BroadcastForm;
  setForm: (form: BroadcastForm) => void;
  templates: Template[];
  groups: { id: string; name: string; memberCount: number }[];
  tags: { id: string; name: string }[];
  campaigns: { id: string; name: string }[];
  sampleContacts: Contact[];
  estimate: { total: number; optedOut: number };
  sending: boolean;
  onSend: () => void;
}) {
  const currentStepIndex = STEPS.findIndex((s) => s.id === step);
  const selectedTemplate = templates.find((t) => t.id === form.templateId);

  const audienceReady =
    form.audienceKind === "all" ||
    form.audienceKind === "opted-in" ||
    (form.audienceKind === "group" && !!form.audienceId) ||
    (form.audienceKind === "tag" && !!form.audienceId);

  const nextStep = () => {
    const next = STEPS[currentStepIndex + 1];
    if (next) setStep(next.id);
  };

  const prevStep = () => {
    const prev = STEPS[currentStepIndex - 1];
    if (prev) setStep(prev.id);
  };

  const audienceName =
    form.audienceKind === "group"
      ? groups.find((g) => g.id === form.audienceId)?.name
      : form.audienceKind === "tag"
        ? form.audienceId
        : form.audienceKind === "opted-in"
          ? "Opted-in contacts"
          : "All contacts";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create broadcast</DialogTitle>
          <DialogDescription>
            Send a message to multiple contacts using an approved template.
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-6">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-sm font-medium",
                  i <= currentStepIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {i + 1}
              </div>
              <span className="ml-2 text-sm">{s.label}</span>
              {i < STEPS.length - 1 && <div className="flex-1 mx-4 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="py-4">
          {step === "template" && (
            <div className="space-y-4">
              <Label>Select a template</Label>
              {templates.filter((t) => t.status === "approved").length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No approved templates yet — create and approve one under Templates first.
                </p>
              ) : (
                <div className="grid gap-3">
                  {templates
                    .filter((t) => t.status === "approved")
                    .map((template) => (
                      <div
                        key={template.id}
                        className={cn(
                          "flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-colors",
                          form.templateId === template.id
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted",
                        )}
                        onClick={() => setForm({ ...form, templateId: template.id })}
                      >
                        <div className="flex-1">
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {template.body}
                          </p>
                        </div>
                        {form.templateId === template.id && (
                          <CheckCircle className="size-5 text-primary" />
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {step === "audience" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Audience</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    { kind: "all" as const, label: "All contacts", icon: Globe },
                    { kind: "opted-in" as const, label: "Opted-in only", icon: CheckCircle },
                    { kind: "group" as const, label: "Group", icon: Users },
                    { kind: "tag" as const, label: "Tag", icon: Tag },
                  ].map(({ kind, label, icon: Icon }) => (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => setForm({ ...form, audienceKind: kind, audienceId: "" })}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors",
                        form.audienceKind === kind
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted",
                      )}
                    >
                      <Icon className="size-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {form.audienceKind === "group" && (
                <div className="space-y-2">
                  <Label>Select group</Label>
                  <Select
                    value={form.audienceId}
                    onValueChange={(v) => setForm({ ...form, audienceId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name} ({group.memberCount} contacts)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {form.audienceKind === "tag" && (
                <div className="space-y-2">
                  <Label>Select tag</Label>
                  <Select
                    value={form.audienceId}
                    onValueChange={(v) => setForm({ ...form, audienceId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a tag" />
                    </SelectTrigger>
                    <SelectContent>
                      {tags.map((tag) => (
                        <SelectItem key={tag.id} value={tag.name}>
                          {tag.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="rounded-lg border p-4 bg-muted/50 text-sm">
                <span className="text-muted-foreground">Estimated recipients: </span>
                <span className="font-medium tabular">{estimate.total}</span>
                {estimate.optedOut > 0 && (
                  <span className="text-muted-foreground">
                    {" "}
                    ({estimate.optedOut} opted-out will be skipped)
                  </span>
                )}
              </div>
            </div>
          )}

          {step === "personalize" && (
            <div className="space-y-4">
              <Label>Personalize preview</Label>
              <p className="text-sm text-muted-foreground">
                Preview how the message will look for sample recipients
              </p>

              <div className="space-y-4">
                {sampleContacts.map((contact) => (
                  <div key={contact.id} className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                        {contact.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">{contact.phone}</p>
                      </div>
                    </div>
                    <div className="rounded-md bg-muted p-3 text-sm">
                      {selectedTemplate?.body.replace(/\{\{1\}\}/g, contact.name) || "Preview..."}
                    </div>
                  </div>
                ))}
                {sampleContacts.length === 0 && (
                  <p className="text-sm text-muted-foreground">No sample contacts found.</p>
                )}
              </div>
            </div>
          )}

          {step === "schedule" && (
            <div className="space-y-4">
              <Label>Broadcast name</Label>
              <Input
                placeholder="e.g. Diwali hampers — VIPs"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <Label>When to send</Label>
              <div className="flex gap-2">
                <Button
                  variant={form.scheduleType === "now" ? "default" : "outline"}
                  onClick={() => setForm({ ...form, scheduleType: "now" })}
                >
                  <Send className="size-4 mr-2" />
                  Send now
                </Button>
                <Button
                  variant={form.scheduleType === "later" ? "default" : "outline"}
                  onClick={() => setForm({ ...form, scheduleType: "later" })}
                >
                  <Calendar className="size-4 mr-2" />
                  Schedule for later
                </Button>
              </div>

              {form.scheduleType === "later" && (
                <div className="space-y-2">
                  <Label>Scheduled time</Label>
                  <Input
                    type="datetime-local"
                    value={form.scheduledAt ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        scheduledAt: e.target.value
                          ? new Date(e.target.value).toISOString()
                          : undefined,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">Must be in the future</p>
                </div>
              )}

              {campaigns.length > 0 && (
                <div className="space-y-2">
                  <Label>Campaign (optional)</Label>
                  <Select
                    value={form.campaignId ?? "none"}
                    onValueChange={(v) =>
                      setForm({ ...form, campaignId: v === "none" ? undefined : v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No campaign" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No campaign</SelectItem>
                      {campaigns.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {step === "review" && (
            <div className="space-y-4">
              <Label>Review and confirm</Label>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{form.name || "Untitled broadcast"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Template</span>
                  <span className="font-medium">{selectedTemplate?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Audience</span>
                  <span className="font-medium">{audienceName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Recipients</span>
                  <span className="font-medium tabular">{estimate.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Schedule</span>
                  <span className="font-medium">
                    {form.scheduleType === "now"
                      ? "Immediately"
                      : form.scheduledAt
                        ? format(new Date(form.scheduledAt), "PPP p")
                        : "Not set"}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium mb-2">Message preview</p>
                <div className="rounded-md bg-muted p-3 text-sm">
                  {selectedTemplate?.body || "No message"}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={prevStep} disabled={currentStepIndex === 0}>
            <ChevronLeft className="size-4 mr-2" />
            Back
          </Button>
          {step === "review" ? (
            <Button
              onClick={onSend}
              disabled={sending || (form.scheduleType === "later" && !form.scheduledAt)}
            >
              <Send className="size-4 mr-2" />
              {form.scheduleType === "now" ? "Send broadcast" : "Schedule broadcast"}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={
                !form.templateId ||
                (step === "audience" && !audienceReady) ||
                (step === "personalize" && sampleContacts.length === 0)
              }
            >
              Next
              <ChevronRight className="size-4 ml-2" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const RECIPIENT_STATUS_CONFIG: Record<
  BroadcastRecipient["status"],
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  pending: { label: "Pending", variant: "secondary" },
  queued: { label: "Queued", variant: "outline" },
  sent: { label: "Sent", variant: "outline" },
  delivered: { label: "Delivered", variant: "default" },
  read: { label: "Read", variant: "default" },
  failed: { label: "Failed", variant: "destructive" },
  skipped: { label: "Skipped", variant: "secondary" },
};

function BroadcastResultsDialog({
  broadcast,
  open,
  onOpenChange,
}: {
  broadcast: Broadcast | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const recipientsQ = useQuery({
    queryKey: ["broadcast-recipients", broadcast?.id],
    queryFn: () => api.broadcasts.recipients(broadcast!.id, { pageSize: 200 }),
    enabled: open && !!broadcast,
  });

  if (!broadcast) return null;

  const recipients = recipientsQ.data?.items ?? [];
  const sent = broadcast.sent;
  const delivered = broadcast.delivered;
  const read = broadcast.read;
  const failed = broadcast.failed ?? 0;
  const skipped = broadcast.skipped ?? 0;

  const funnelData = [
    { label: "Sent", value: sent, color: "bg-primary" },
    { label: "Delivered", value: delivered, color: "bg-success" },
    { label: "Read", value: read, color: "bg-info" },
    { label: "Skipped", value: skipped, color: "bg-warning" },
    { label: "Failed", value: failed, color: "bg-destructive" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{broadcast.name} - Results</DialogTitle>
          <DialogDescription>Delivery metrics for this broadcast.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Funnel */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Delivery funnel</h3>
            <div className="grid gap-4 sm:grid-cols-5">
              {funnelData.map((item) => (
                <div key={item.label} className="text-center">
                  <div className="mx-auto size-16 rounded-full flex items-center justify-center mb-2">
                    <div
                      className={cn(
                        "size-full rounded-full flex items-center justify-center text-sm font-bold tabular",
                        item.color,
                      )}
                    >
                      {item.value}
                    </div>
                  </div>
                  <p className="text-sm font-medium">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total sent" value={formatNumber(sent)} icon={Send} />
            <StatCard
              label="Delivery rate"
              value={sent > 0 ? `${((delivered / sent) * 100).toFixed(1)}%` : "—"}
              icon={CheckCircle}
            />
            <StatCard
              label="Read rate"
              value={sent > 0 ? `${((read / sent) * 100).toFixed(1)}%` : "—"}
              icon={Eye}
            />
          </div>

          {/* Per-recipient log */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Per-recipient log</h3>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Delivered at</TableHead>
                    <TableHead>Read at</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipientsQ.isPending ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <ListSkeleton rows={3} />
                      </TableCell>
                    </TableRow>
                  ) : recipients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No recipient data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    recipients.map((log) => {
                      const cfg = RECIPIENT_STATUS_CONFIG[log.status];
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{log.contactName}</TableCell>
                          <TableCell className="tabular">{log.phone}</TableCell>
                          <TableCell>
                            <Badge variant={cfg.variant}>{cfg.label}</Badge>
                            {log.error && (
                              <p className="text-xs text-destructive mt-1">{log.error}</p>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {log.deliveredAt ? format(new Date(log.deliveredAt), "HH:mm") : "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {log.readAt ? format(new Date(log.readAt), "HH:mm") : "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            {recipientsQ.data && recipientsQ.data.total > recipients.length && (
              <p className="text-xs text-muted-foreground">
                Showing {recipients.length} of {recipientsQ.data.total} recipients
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
