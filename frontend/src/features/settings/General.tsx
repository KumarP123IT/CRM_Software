import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/api";
import { useAuth } from "@/stores/auth";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ErrorState, ListSkeleton } from "@/components/shared";
import { SettingsPage } from "./SettingsPage";

export function General() {
  const workspaceId = useAuth((s) => s.workspaceId);
  const q = useQuery({
    queryKey: ["workspaces"],
    queryFn: () => api.workspaces.list(),
  });
  const current = q.data?.find((w) => w.id === workspaceId) ?? q.data?.[0];
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("chai-point-cafe");

  if (q.isPending) return <ListSkeleton rows={4} />;
  if (q.isError) return <ErrorState onRetry={() => q.refetch()} />;

  const workspaceName = name || current?.name || "";

  return (
    <SettingsPage
      title="General"
      description="Workspace identity and regional defaults for India (INR, IST, +91)."
    >
      <Card className="p-6">
        <form
          className="max-w-lg space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Workspace details saved");
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="workspace-name">Workspace name</Label>
            <Input
              id="workspace-name"
              value={workspaceName}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Workspace URL</Label>
            <div className="flex items-center">
              <span className="mr-2 text-sm text-muted-foreground">konvo.app/</span>
              <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input id="timezone" defaultValue="Asia/Kolkata (IST)" readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Input id="language" defaultValue="English" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" defaultValue="India" readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" defaultValue="INR (₹)" readOnly />
          </div>
          <Button type="submit">Save changes</Button>
        </form>
      </Card>
    </SettingsPage>
  );
}
