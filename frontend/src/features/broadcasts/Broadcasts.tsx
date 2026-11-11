import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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
  ChevronRight,
  ChevronLeft,
  Calendar,
  IndianRupee,
  Users,
  Filter,
  Play,
  Pause,
  Eye,
  Trash2,
  BarChart3,
} from "lucide-react";
import { api, type Broadcast, type Template, type Contact } from "@/api";
import {
  PageHeader,
  EmptyState,
  ErrorState,
  ListSkeleton,
  StatCard,
} from "@/components/shared";
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
  DropdownMenuLabel,
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import { format } from "date-fns";

type BroadcastStep =
  "template" | "audience" | "personalize" | "schedule" | "review" | "results";

interface BroadcastForm {
  templateId: string;
  audienceType: "group" | "filter";
  audienceId: string;
  excludeOptedOut: boolean;
  variables: Record<string, string>;
  scheduleType: "now" | "later";
  scheduledAt?: Date;
}

interface BroadcastResult {
  id: string;
  name: string;
  sent: number;
  delivered: number;
  read: number;
  replied: number;
  failed: number;
  cost: number;
  perRecipient: Array<{
    contactId: string;
    contactName: string;
    phone: string;
    status: "sent" | "delivered" | "read" | "replied" | "failed";
    deliveredAt?: string;
    readAt?: string;
    repliedAt?: string;
    error?: string;
  }>;
}

const DAILY_LIMIT = 1000;
const COST_PER_MESSAGE = 0.5; // INR

// Mock data
const MOCK_GROUPS = [
  { id: "g1", name: "VIP Customers", memberCount: 12 },
  { id: "g2", name: "Mumbai Region", memberCount: 18 },
  { id: "g3", name: "Diwali Campaign List", memberCount: 45 },
];

const SAMPLE_CONTACTS: Contact[] = [
  {
    id: "c1",
    name: "Aarav Patel",
    phone: "+91 98765 43210",
    email: "aarav@example.com",
    city: "Mumbai",
    tags: ["VIP"],
    optedIn: true,
    lifetimeValue: 15000,
    lastSeenAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    customFields: [],
    notes: "",
  },
  {
    id: "c2",
    name: "Diya Sharma",
    phone: "+91 87654 32109",
    email: "diya@example.com",
    city: "Delhi",
    tags: ["Repeat buyer"],
    optedIn: true,
    lifetimeValue: 8500,
    lastSeenAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    customFields: [],
    notes: "",
  },
  {
    id: "c3",
    name: "Arjun Singh",
    phone: "+91 76543 21098",
    email: "arjun@example.com",
    city: "Bengaluru",
    tags: ["New"],
    optedIn: false,
    lifetimeValue: 2500,
    lastSeenAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    customFields: [],
    notes: "",
  },
];

export function Broadcasts() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] =
    useState<BroadcastResult | null>(null);
  const [step, setStep] = useState<BroadcastStep>("template");
  const [form, setForm] = useState<BroadcastForm>({
    templateId: "",
    audienceType: "group",
    audienceId: "",
    excludeOptedOut: true,
    variables: {},
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

  const filteredBroadcasts =
    q.data?.filter((b) =>
      b.name.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  const selectedTemplate = templatesQ.data?.find(
    (t) => t.id === form.templateId,
  );
  const audienceSize =
    MOCK_GROUPS.find((g) => g.id === form.audienceId)?.memberCount ?? 0;
  const optedOutCount = SAMPLE_CONTACTS.filter((c) => !c.optedIn).length;
  const finalAudienceSize = form.excludeOptedOut
    ? audienceSize - optedOutCount
    : audienceSize;
  const estimatedCost = finalAudienceSize * COST_PER_MESSAGE;

  const resetWizard = () => {
    setStep("template");
    setForm({
      templateId: "",
      audienceType: "group",
      audienceId: "",
      excludeOptedOut: true,
      variables: {},
      scheduleType: "now",
    });
  };

  const handleClose = () => {
    resetWizard();
    setWizardOpen(false);
  };

  const handleSend = () => {
    toast.success("Broadcast scheduled successfully");
    handleClose();
    void qc.invalidateQueries({ queryKey: ["broadcasts"] });
  };

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
        {/* Daily Limit Meter */}
        <div className="mb-4 p-4 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Daily messaging limit</span>
            <span className="text-sm text-muted-foreground">
              0 / {DAILY_LIMIT} messages
            </span>
          </div>
          <Progress value={0} className="h-2" />
        </div>

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
                {filteredBroadcasts.map((broadcast) => (
                  <TableRow key={broadcast.id}>
                    <TableCell className="font-medium">
                      {broadcast.name}
                    </TableCell>
                    <TableCell>{broadcast.audience}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          broadcast.status === "sent"
                            ? "default"
                            : broadcast.status === "scheduled"
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {broadcast.status === "sent" && (
                          <CheckCircle className="mr-1 size-3" />
                        )}
                        {broadcast.status === "scheduled" && (
                          <Clock className="mr-1 size-3" />
                        )}
                        {broadcast.status === "draft" && (
                          <Megaphone className="mr-1 size-3" />
                        )}
                        {broadcast.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular">{broadcast.sent}</TableCell>
                    <TableCell className="tabular">
                      {broadcast.delivered}
                    </TableCell>
                    <TableCell className="tabular">{broadcast.read}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {broadcast.status === "sent" && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedBroadcast({
                                  id: broadcast.id,
                                  name: broadcast.name,
                                  sent: broadcast.sent,
                                  delivered: broadcast.delivered,
                                  read: broadcast.read,
                                  replied: Math.floor(broadcast.read * 0.4),
                                  failed: broadcast.sent - broadcast.delivered,
                                  cost: broadcast.sent * COST_PER_MESSAGE,
                                  perRecipient: [],
                                });
                                setResultsOpen(true);
                              }}
                            >
                              <BarChart3 className="mr-2 size-4" />
                              View results
                            </DropdownMenuItem>
                          )}
                          {broadcast.status === "scheduled" && (
                            <DropdownMenuItem>
                              <Pause className="mr-2 size-4" />
                              Pause
                            </DropdownMenuItem>
                          )}
                          {broadcast.status === "draft" && (
                            <DropdownMenuItem>
                              <Send className="mr-2 size-4" />
                              Send now
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
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
        groups={MOCK_GROUPS}
        sampleContacts={SAMPLE_CONTACTS}
        onSend={handleSend}
      />

      {/* Results Dialog */}
      <BroadcastResultsDialog
        result={selectedBroadcast}
        open={resultsOpen}
        onOpenChange={setResultsOpen}
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
  sampleContacts,
  onSend,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step: BroadcastStep;
  setStep: (step: BroadcastStep) => void;
  form: BroadcastForm;
  setForm: (form: BroadcastForm) => void;
  templates: Template[];
  groups: Array<{ id: string; name: string; memberCount: number }>;
  sampleContacts: Contact[];
  onSend: () => void;
}) {
  const STEPS = [
    { id: "template" as const, label: "Template" },
    { id: "audience" as const, label: "Audience" },
    { id: "personalize" as const, label: "Personalize" },
    { id: "schedule" as const, label: "Schedule" },
    { id: "review" as const, label: "Review" },
  ];

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);
  const selectedTemplate = templates.find((t) => t.id === form.templateId);
  const audienceSize =
    groups.find((g) => g.id === form.audienceId)?.memberCount ?? 0;
  const optedOutCount = sampleContacts.filter((c) => !c.optedIn).length;
  const finalAudienceSize = form.excludeOptedOut
    ? audienceSize - optedOutCount
    : audienceSize;
  const estimatedCost = finalAudienceSize * COST_PER_MESSAGE;

  const nextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setStep(STEPS[currentStepIndex + 1].id);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setStep(STEPS[currentStepIndex - 1].id);
    }
  };

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
              {i < STEPS.length - 1 && (
                <div className="flex-1 mx-4 h-px bg-border" />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="py-4">
          {step === "template" && (
            <div className="space-y-4">
              <Label>Select a template</Label>
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
                      onClick={() =>
                        setForm({ ...form, templateId: template.id })
                      }
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
            </div>
          )}

          {step === "audience" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Audience type</Label>
                <div className="flex gap-2">
                  <Button
                    variant={
                      form.audienceType === "group" ? "default" : "outline"
                    }
                    onClick={() => setForm({ ...form, audienceType: "group" })}
                  >
                    <Users className="size-4 mr-2" />
                    Group
                  </Button>
                  <Button
                    variant={
                      form.audienceType === "filter" ? "default" : "outline"
                    }
                    onClick={() => setForm({ ...form, audienceType: "filter" })}
                  >
                    <Filter className="size-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>

              {form.audienceType === "group" && (
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

              <div className="flex items-center gap-2">
                <Checkbox
                  id="excludeOptedOut"
                  checked={form.excludeOptedOut}
                  onCheckedChange={(v) =>
                    setForm({ ...form, excludeOptedOut: v as boolean })
                  }
                />
                <Label htmlFor="excludeOptedOut" className="flex-1">
                  Exclude opted-out contacts
                </Label>
              </div>

              {form.excludeOptedOut && (
                <div className="rounded-lg border p-4 bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-2">
                    {optedOutCount} contacts will be excluded
                  </p>
                  <div className="space-y-1">
                    {sampleContacts
                      .filter((c) => !c.optedIn)
                      .map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <XCircle className="size-4 text-destructive" />
                          <span>{c.name}</span>
                          <span className="text-muted-foreground">
                            {c.phone}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="text-sm">
                <span className="text-muted-foreground">
                  Total recipients:{" "}
                </span>
                <span className="font-medium tabular">{finalAudienceSize}</span>
              </div>
            </div>
          )}

          {step === "personalize" && (
            <div className="space-y-4">
              <Label>Personalize variables</Label>
              <p className="text-sm text-muted-foreground">
                Preview how the message will look for each contact
              </p>

              <div className="space-y-4">
                {sampleContacts.slice(0, 3).map((contact) => (
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
                        <p className="text-xs text-muted-foreground">
                          {contact.phone}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-md bg-muted p-3 text-sm">
                      {selectedTemplate?.body
                        .replace(/\{\{1\}\}/g, contact.name)
                        .replace(/\{\{2\}\}/g, "12345") || "Preview..."}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === "schedule" && (
            <div className="space-y-4">
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
                  variant={
                    form.scheduleType === "later" ? "default" : "outline"
                  }
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
                    onChange={(e) =>
                      setForm({
                        ...form,
                        scheduledAt: new Date(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Timezone: Asia/Kolkata (IST)
                  </p>
                </div>
              )}

              <div className="rounded-lg border p-4 bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Estimated cost</span>
                  <span className="text-lg font-bold tabular text-primary">
                    ₹{formatNumber(estimatedCost)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {finalAudienceSize} messages × ₹{COST_PER_MESSAGE}/message
                </p>
              </div>
            </div>
          )}

          {step === "review" && (
            <div className="space-y-4">
              <Label>Review and confirm</Label>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Template</span>
                  <span className="font-medium">{selectedTemplate?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Audience</span>
                  <span className="font-medium">
                    {groups.find((g) => g.id === form.audienceId)?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Recipients</span>
                  <span className="font-medium tabular">
                    {finalAudienceSize}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Schedule</span>
                  <span className="font-medium">
                    {form.scheduleType === "now"
                      ? "Immediately"
                      : format(form.scheduledAt!, "PPP p")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated cost</span>
                  <span className="font-medium tabular text-primary">
                    ₹{formatNumber(estimatedCost)}
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
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft className="size-4 mr-2" />
            Back
          </Button>
          {step === "review" ? (
            <Button onClick={onSend}>
              <Send className="size-4 mr-2" />
              {form.scheduleType === "now"
                ? "Send broadcast"
                : "Schedule broadcast"}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={
                !form.templateId || (step === "audience" && !form.audienceId)
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

function BroadcastResultsDialog({
  result,
  open,
  onOpenChange,
}: {
  result: BroadcastResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!result) return null;

  const funnelData = [
    { label: "Sent", value: result.sent, color: "bg-primary" },
    { label: "Delivered", value: result.delivered, color: "bg-success" },
    { label: "Read", value: result.read, color: "bg-info" },
    { label: "Replied", value: result.replied, color: "bg-warning" },
    { label: "Failed", value: result.failed, color: "bg-destructive" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{result.name} - Results</DialogTitle>
          <DialogDescription>
            Delivery and engagement metrics for this broadcast.
          </DialogDescription>
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
            <StatCard
              label="Total sent"
              value={formatNumber(result.sent)}
              icon={Send}
            />
            <StatCard
              label="Delivery rate"
              value={`${((result.delivered / result.sent) * 100).toFixed(1)}%`}
              icon={CheckCircle}
            />
            <StatCard
              label="Total cost"
              value={`₹${formatNumber(result.cost)}`}
              icon={IndianRupee}
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
                  {result.perRecipient.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground py-8"
                      >
                        No recipient data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    result.perRecipient.map((log) => (
                      <TableRow key={log.contactId}>
                        <TableCell className="font-medium">
                          {log.contactName}
                        </TableCell>
                        <TableCell className="tabular">{log.phone}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              log.status === "failed"
                                ? "destructive"
                                : log.status === "replied"
                                  ? "default"
                                  : "outline"
                            }
                          >
                            {log.status}
                          </Badge>
                          {log.error && (
                            <p className="text-xs text-destructive mt-1">
                              {log.error}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {log.deliveredAt
                            ? format(new Date(log.deliveredAt), "HH:mm")
                            : "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {log.readAt
                            ? format(new Date(log.readAt), "HH:mm")
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
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
