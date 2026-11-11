import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeIndianRupee,
  Copy,
  ExternalLink,
  MousePointerClick,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { api, type Ad, type CreateAdInput, type UpdateAdInput } from "@/api";
import { BASE_URL } from "@/api/http";
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

function clickUrl(ad: Ad): string {
  return `${BASE_URL}/ads/click/${ad.id}`;
}

async function copy(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  } catch {
    toast.error("Couldn't copy to clipboard");
  }
}

export function Ads() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Ad | "new" | null>(null);

  const q = useQuery({ queryKey: ["ads"], queryFn: () => api.ads.list() });

  const toggle = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => api.ads.update(id, { active }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["ads"] }),
    onError: () => toast.error("Couldn't update ad"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.ads.remove(id),
    onSuccess: () => {
      toast.success("Ad deleted");
      void qc.invalidateQueries({ queryKey: ["ads"] });
    },
    onError: () => toast.error("Couldn't delete ad"),
  });

  const ads = q.data ?? [];
  const totalClicks = ads.reduce((s, a) => s + a.clicks, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ads"
        description="Click-to-WhatsApp ads — share the tracked link and every click opens a chat with your number."
        actions={
          <Guarded perm="settings.manage">
            <Button onClick={() => setEditing("new")}>
              <Plus className="mr-2 size-4" />
              New ad
            </Button>
          </Guarded>
        }
      />

      {ads.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MousePointerClick className="size-4" />
          {totalClicks.toLocaleString()} total clicks across {ads.filter((a) => a.active).length}{" "}
          active ads
        </div>
      )}

      {q.isPending ? (
        <ListSkeleton rows={4} />
      ) : q.isError ? (
        <ErrorState onRetry={() => void q.refetch()} />
      ) : ads.length === 0 ? (
        <EmptyState
          icon={BadgeIndianRupee}
          title="No ads yet"
          description="Create an ad to get a trackable wa.me link that opens WhatsApp with a pre-filled message."
          action={
            <Guarded perm="settings.manage">
              <Button onClick={() => setEditing("new")}>
                <Plus className="mr-2 size-4" />
                New ad
              </Button>
            </Guarded>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ads.map((a) => (
            <Card key={a.id} className={cn("flex flex-col p-5", !a.active && "opacity-60")}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{a.name}</p>
                  <p className="text-xs text-muted-foreground">+{a.phone}</p>
                </div>
                <Switch
                  checked={a.active}
                  onCheckedChange={(active) => toggle.mutate({ id: a.id, active })}
                  aria-label={`Toggle ${a.name}`}
                />
              </div>
              {a.message && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">“{a.message}”</p>
              )}
              <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MousePointerClick className="size-3.5" />
                {a.clicks.toLocaleString()} clicks
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void copy(clickUrl(a), "Tracked link")}
                >
                  <Copy className="mr-1.5 size-3.5" />
                  Copy link
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href={a.waLink} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-1.5 size-3.5" />
                    wa.me
                  </a>
                </Button>
                <Badge variant="secondary" className="ml-auto text-[10px] font-normal">
                  {a.active ? "active" : "paused"}
                </Badge>
              </div>
              <div className="mt-3 flex items-center justify-end gap-2 border-t pt-3">
                <button
                  onClick={() => setEditing(a)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Edit
                </button>
                <Guarded perm="settings.manage">
                  <button
                    onClick={() => remove.mutate(a.id)}
                    className="p-1 text-muted-foreground hover:text-destructive"
                    aria-label={`Delete ${a.name}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </Guarded>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <AdDialog ad={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function AdDialog({ ad, onClose }: { ad: Ad | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState(ad?.name ?? "");
  const [phone, setPhone] = useState(ad?.phone ?? "");
  const [message, setMessage] = useState(ad?.message ?? "");
  const [active, setActive] = useState(ad?.active ?? true);

  const save = useMutation({
    mutationFn: async () => {
      if (ad) {
        const input: UpdateAdInput = {
          name: name.trim(),
          phone: phone.trim(),
          message: message.trim(),
          active,
        };
        return api.ads.update(ad.id, input);
      }
      const input: CreateAdInput = {
        name: name.trim(),
        phone: phone.trim(),
        message: message.trim(),
        active,
      };
      return api.ads.create(input);
    },
    onSuccess: () => {
      toast.success(ad ? "Ad updated" : "Ad created");
      void qc.invalidateQueries({ queryKey: ["ads"] });
      onClose();
    },
    onError: () => toast.error("Couldn't save ad"),
  });

  const canSubmit = name.trim() && phone.replace(/\D/g, "").length >= 6;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{ad ? "Edit ad" : "New ad"}</DialogTitle>
          <DialogDescription>
            Generates a wa.me link — optionally pre-filled with a message — plus a tracked URL that
            counts clicks before redirecting.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="ad-name">Name</Label>
            <Input
              id="ad-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Diwali offer — WhatsApp"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ad-phone">WhatsApp number</Label>
            <Input
              id="ad-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="919876543210"
              inputMode="tel"
            />
            <p className="text-xs text-muted-foreground">Country code + number, digits only.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ad-message">Pre-filled message (optional)</Label>
            <Textarea
              id="ad-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Hi! I'm interested in…"
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch id="ad-active" checked={active} onCheckedChange={setActive} />
            <Label htmlFor="ad-active">Active</Label>
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
            {ad ? "Save" : "Create ad"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
