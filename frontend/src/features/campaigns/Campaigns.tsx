import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Rocket,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Megaphone,
  Users,
  Send,
  Eye,
} from "lucide-react";
import { api, type Campaign, type CampaignStatus } from "@/api";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import { format } from "date-fns";

const STATUS_CONFIG: Record<
  CampaignStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: typeof Play }
> = {
  draft: { label: "Draft", variant: "secondary", icon: Pencil },
  active: { label: "Active", variant: "default", icon: Play },
  paused: { label: "Paused", variant: "outline", icon: Pause },
  completed: { label: "Completed", variant: "default", icon: CheckCircle },
  cancelled: { label: "Cancelled", variant: "destructive", icon: XCircle },
};

const BROADCAST_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  sending: "Sending",
  sent: "Sent",
  cancelled: "Cancelled",
  failed: "Failed",
};

export function Campaigns() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Campaign | null>(null);

  const q = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => api.campaigns.list(),
  });

  const filtered = q.data?.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())) ?? [];

  const invalidate = () => void qc.invalidateQueries({ queryKey: ["campaigns"] });
  const onError = (e: unknown) =>
    toast.error(e instanceof Error ? e.message : "Something went wrong");

  const deleteCampaign = useMutation({
    mutationFn: (id: string) => api.campaigns.remove(id),
    onSuccess: () => {
      toast.success("Campaign deleted");
      invalidate();
    },
    onError,
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CampaignStatus }) =>
      api.campaigns.update(id, { status }),
    onSuccess: () => {
      toast.success("Campaign updated");
      invalidate();
    },
    onError,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        description="Group broadcasts into coordinated marketing pushes."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4 mr-2" />
            New campaign
          </Button>
        }
      />

      <Card className="p-4">
        <div className="relative max-w-sm mb-4">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {q.isPending ? (
          <ListSkeleton rows={4} />
        ) : q.isError ? (
          <ErrorState onRetry={() => q.refetch()} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Rocket}
            title="No campaigns yet"
            description="Create a campaign to group related broadcasts and track combined results."
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="size-4 mr-2" />
                New campaign
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Broadcasts</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Delivered</TableHead>
                  <TableHead>Read</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((campaign) => {
                  const config = STATUS_CONFIG[campaign.status];
                  const StatusIcon = config.icon;
                  return (
                    <TableRow
                      key={campaign.id}
                      className="cursor-pointer"
                      onClick={() => setDetailId(campaign.id)}
                    >
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>
                        <Badge variant={config.variant} className="gap-1">
                          <StatusIcon className="size-3" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="tabular">{campaign.broadcastCount}</TableCell>
                      <TableCell className="tabular">{campaign.sent}</TableCell>
                      <TableCell className="tabular">{campaign.delivered}</TableCell>
                      <TableCell className="tabular">{campaign.read}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(campaign.createdAt), "d MMM yyyy")}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setDetailId(campaign.id)}>
                              <Eye className="mr-2 size-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditing(campaign)}>
                              <Pencil className="mr-2 size-4" />
                              Rename
                            </DropdownMenuItem>
                            {campaign.status === "draft" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  setStatus.mutate({ id: campaign.id, status: "active" })
                                }
                              >
                                <Play className="mr-2 size-4" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            {campaign.status === "active" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  setStatus.mutate({ id: campaign.id, status: "paused" })
                                }
                              >
                                <Pause className="mr-2 size-4" />
                                Pause
                              </DropdownMenuItem>
                            )}
                            {["active", "paused"].includes(campaign.status) && (
                              <DropdownMenuItem
                                onClick={() =>
                                  setStatus.mutate({ id: campaign.id, status: "completed" })
                                }
                              >
                                <CheckCircle className="mr-2 size-4" />
                                Mark completed
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteCampaign.mutate(campaign.id)}
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete
                            </DropdownMenuItem>
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

      <CampaignDialog open={createOpen} onOpenChange={setCreateOpen} campaign={null} />
      <CampaignDialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        campaign={editing}
      />
      <CampaignDetailDialog
        campaignId={detailId}
        open={detailId !== null}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
      />
    </div>
  );
}

function CampaignDialog({
  open,
  onOpenChange,
  campaign,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign | null;
}) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Sync fields when the dialog opens for a different campaign.
  useEffect(() => {
    if (open) {
      setName(campaign?.name ?? "");
      setDescription(campaign?.description ?? "");
    }
  }, [open, campaign]);

  const save = useMutation({
    mutationFn: () =>
      campaign
        ? api.campaigns.update(campaign.id, { name: name.trim(), description })
        : api.campaigns.create({ name: name.trim(), description }),
    onSuccess: () => {
      toast.success(campaign ? "Campaign updated" : "Campaign created");
      void qc.invalidateQueries({ queryKey: ["campaigns"] });
      onOpenChange(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Something went wrong"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{campaign ? "Edit campaign" : "New campaign"}</DialogTitle>
          <DialogDescription>
            Campaigns group related broadcasts so you can track combined results.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="campaign-name">Name</Label>
            <Input
              id="campaign-name"
              placeholder="e.g. Diwali 2026 promo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="campaign-desc">Description (optional)</Label>
            <Textarea
              id="campaign-desc"
              placeholder="What is this campaign for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => save.mutate()} disabled={!name.trim() || save.isPending}>
            {campaign ? "Save changes" : "Create campaign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CampaignDetailDialog({
  campaignId,
  open,
  onOpenChange,
}: {
  campaignId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const q = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: () => api.campaigns.get(campaignId!),
    enabled: open && !!campaignId,
  });

  const campaign = q.data;
  const config = campaign ? STATUS_CONFIG[campaign.status] : null;
  const StatusIcon = config?.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {campaign?.name ?? "Campaign"}
            {config && StatusIcon && (
              <Badge variant={config.variant} className="gap-1">
                <StatusIcon className="size-3" />
                {config.label}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>{campaign?.description || "No description"}</DialogDescription>
        </DialogHeader>

        {q.isPending ? (
          <ListSkeleton rows={3} />
        ) : q.isError || !campaign ? (
          <ErrorState onRetry={() => q.refetch()} />
        ) : (
          <div className="space-y-6 py-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                label="Broadcasts"
                value={formatNumber(campaign.broadcastCount)}
                icon={Megaphone}
              />
              <StatCard label="Delivered" value={formatNumber(campaign.delivered)} icon={Send} />
              <StatCard label="Read" value={formatNumber(campaign.read)} icon={Users} />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium">Broadcasts</h3>
              {campaign.broadcasts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No broadcasts in this campaign yet. Create one from the Broadcasts page and pick
                  this campaign.
                </p>
              ) : (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Template</TableHead>
                        <TableHead>Audience</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sent</TableHead>
                        <TableHead>Read</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaign.broadcasts.map((b) => (
                        <TableRow key={b.id}>
                          <TableCell className="font-medium">{b.name}</TableCell>
                          <TableCell>{b.templateName ?? "—"}</TableCell>
                          <TableCell>{b.audience}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {BROADCAST_STATUS_LABEL[b.status] ?? b.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="tabular">{b.sent}</TableCell>
                          <TableCell className="tabular">{b.read}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
