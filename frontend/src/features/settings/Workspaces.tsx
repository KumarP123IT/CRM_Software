import { useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { api } from "@/api";
import { useAuth } from "@/stores/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/shared";
import { SettingsPage } from "./SettingsPage";

export function Workspaces() {
  const { workspaceId, setWorkspace } = useAuth();
  const q = useQuery({
    queryKey: ["workspaces"],
    queryFn: () => api.workspaces.list(),
  });
  const workspaces = q.data ?? [];

  return (
    <SettingsPage
      title="My Workspaces"
      description="Switch between businesses you belong to. Isolation is enforced on the backend in a later phase."
    >
      {q.isPending ? (
        <ListSkeleton rows={3} />
      ) : q.isError ? (
        <ErrorState onRetry={() => q.refetch()} />
      ) : workspaces.length === 0 ? (
        <Card>
          <EmptyState
            icon={Building2}
            title="No workspaces"
            description="Create a workspace from the register page."
          />
        </Card>
      ) : (
        <ul className="grid gap-3">
          {workspaces.map((w) => (
            <li key={w.id}>
              <Card className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{w.name}</p>
                  <p className="text-sm text-muted-foreground">{w.city}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{w.plan}</Badge>
                  {w.id === workspaceId ? (
                    <Badge>Active</Badge>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => setWorkspace(w.id)}>
                      Switch
                    </Button>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </SettingsPage>
  );
}
