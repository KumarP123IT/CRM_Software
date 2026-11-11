import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Target, Plus, Search, Trash2, User } from "lucide-react";
import { api, type Contact, type CreateLeadInput, type Lead, type LeadStage } from "@/api";
import { usePermission } from "@/lib/permissions";
import { formatINR, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PageHeader, EmptyState, ErrorState, ListSkeleton } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
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
import { toast } from "sonner";

const STAGES: { id: LeadStage; label: string; dot: string }[] = [
  { id: "new", label: "New", dot: "bg-info" },
  { id: "contacted", label: "Contacted", dot: "bg-primary" },
  { id: "qualified", label: "Qualified", dot: "bg-warning" },
  { id: "proposal", label: "Proposal", dot: "bg-warning" },
  { id: "won", label: "Won", dot: "bg-success" },
  { id: "lost", label: "Lost", dot: "bg-destructive" },
];

export function Leads() {
  const qc = useQueryClient();
  const { allowed: canEdit } = usePermission("lead.edit");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const q = useQuery({
    queryKey: ["leads", { search }],
    queryFn: () => api.leads.list({ search: search || undefined, pageSize: 200 }),
  });

  const moveStage = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: LeadStage }) =>
      api.leads.update(id, { stage }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["leads"] }),
    onError: () => toast.error("Failed to move lead"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.leads.remove(id),
    onSuccess: () => {
      toast.success("Lead deleted");
      void qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: () => toast.error("Failed to delete lead"),
  });

  const byStage = useMemo(() => {
    const map = new Map<LeadStage, Lead[]>();
    for (const s of STAGES) map.set(s.id, []);
    for (const l of q.data?.items ?? []) map.get(l.stage)?.push(l);
    return map;
  }, [q.data]);

  const totalValue = (q.data?.items ?? [])
    .filter((l) => l.stage !== "lost")
    .reduce((s, l) => s + l.value, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description={`${q.data?.total ?? 0} leads · ${formatINR(totalValue)} open pipeline`}
        actions={
          canEdit ? (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4 mr-2" />
              New lead
            </Button>
          ) : undefined
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search leads…"
          className="pl-8"
        />
      </div>

      {q.isPending ? (
        <ListSkeleton rows={6} />
      ) : q.isError ? (
        <ErrorState onRetry={() => void q.refetch()} />
      ) : (q.data?.items.length ?? 0) === 0 ? (
        <EmptyState
          icon={Target}
          title="No leads yet"
          description="Leads appear when you mark a contact as a lead, or create one manually."
          action={
            canEdit ? (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="size-4 mr-2" />
                New lead
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {STAGES.map((stage) => {
            const leads = byStage.get(stage.id) ?? [];
            const value = leads.reduce((s, l) => s + l.value, 0);
            return (
              <div key={stage.id} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <span className={cn("size-2 rounded-full", stage.dot)} />
                  <h3 className="text-sm font-semibold capitalize">{stage.label}</h3>
                  <Badge variant="secondary" className="ml-auto text-[10px]">
                    {leads.length}
                  </Badge>
                </div>
                {value > 0 && (
                  <p className="px-1 text-xs text-muted-foreground">{formatINR(value)}</p>
                )}
                <div className="space-y-2">
                  {leads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      canEdit={canEdit}
                      onMove={(s) => moveStage.mutate({ id: lead.id, stage: s })}
                      onDelete={() => remove.mutate(lead.id)}
                    />
                  ))}
                  {leads.length === 0 && (
                    <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                      No leads
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateLeadDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

function LeadCard({
  lead,
  canEdit,
  onMove,
  onDelete,
}: {
  lead: Lead;
  canEdit: boolean;
  onMove: (stage: LeadStage) => void;
  onDelete: () => void;
}) {
  return (
    <Card className="p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{lead.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {lead.contactName ?? lead.phone ?? "Unknown contact"}
          </p>
        </div>
        {canEdit && (
          <button
            onClick={onDelete}
            className="text-muted-foreground hover:text-destructive"
            aria-label="Delete lead"
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-semibold tabular">{formatINR(lead.value)}</span>
        <span className="text-[10px] text-muted-foreground">{timeAgo(lead.updatedAt)}</span>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <User className="size-3" />
        <span className="truncate">{lead.ownerName ?? "Unassigned"}</span>
      </div>
      {canEdit && (
        <Select value={lead.stage} onValueChange={(v) => onMove(v as LeadStage)}>
          <SelectTrigger className="mt-2 h-7 w-full text-[11px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STAGES.map((s) => (
              <SelectItem key={s.id} value={s.id} className="text-xs capitalize">
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </Card>
  );
}

function CreateLeadDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const [contactId, setContactId] = useState("");
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [stage, setStage] = useState<LeadStage>("new");
  const [ownerId, setOwnerId] = useState("");

  const contactsQuery = useQuery({
    queryKey: ["contacts", "lead-picker"],
    queryFn: () => api.contacts.list({ pageSize: 100 }),
    enabled: open,
  });
  const teamQuery = useQuery({
    queryKey: ["team-members"],
    queryFn: () => api.team.list(),
    enabled: open,
  });

  const create = useMutation({
    mutationFn: (input: CreateLeadInput) => api.leads.create(input),
    onSuccess: () => {
      toast.success("Lead created");
      void qc.invalidateQueries({ queryKey: ["leads"] });
      onOpenChange(false);
      setContactId("");
      setTitle("");
      setValue("");
      setStage("new");
      setOwnerId("");
    },
    onError: () => toast.error("Failed to create lead"),
  });

  const contacts: Contact[] = contactsQuery.data?.items ?? [];
  const canSubmit = contactId && title.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New lead</DialogTitle>
          <DialogDescription>Track a deal from first hello to paid.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Contact</Label>
            <Select value={contactId} onValueChange={setContactId}>
              <SelectTrigger>
                <SelectValue placeholder="Pick a contact…" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name || c.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lead-title">Title</Label>
            <Input
              id="lead-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Corporate catering — 120 pax"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lead-value">Value (₹)</Label>
              <Input
                id="lead-value"
                type="number"
                min={0}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Stage</Label>
              <Select value={stage} onValueChange={(v) => setStage(v as LeadStage)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="capitalize">
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Owner</Label>
            <Select value={ownerId || "me"} onValueChange={setOwnerId}>
              <SelectTrigger>
                <SelectValue placeholder="Assign to…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="me">Me</SelectItem>
                {(teamQuery.data ?? []).map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!canSubmit || create.isPending}
            loading={create.isPending}
            onClick={() =>
              create.mutate({
                contactId,
                title: title.trim(),
                ...(value ? { value: Number(value) } : {}),
                stage,
                ...(ownerId && ownerId !== "me" ? { ownerId } : {}),
              })
            }
          >
            Create lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
