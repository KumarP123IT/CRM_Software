import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tags as TagsIcon } from "lucide-react";
import { api } from "@/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/shared";
import { SettingsPage } from "./SettingsPage";

export function Tags() {
  const q = useQuery({
    queryKey: ["contacts", { pageSize: 50 }],
    queryFn: () => api.contacts.list({ pageSize: 50 }),
  });

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of q.data?.items ?? []) {
      for (const t of c.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [q.data]);

  return (
    <SettingsPage
      title="Tags"
      description="Labels used to filter contacts, conversations and broadcast audiences."
    >
      {q.isPending ? (
        <ListSkeleton rows={3} />
      ) : q.isError ? (
        <ErrorState onRetry={() => q.refetch()} />
      ) : tags.length === 0 ? (
        <Card>
          <EmptyState
            icon={TagsIcon}
            title="No tags"
            description="Tags show up here as you apply them to contacts."
          />
        </Card>
      ) : (
        <Card className="flex flex-wrap gap-2 p-6">
          {tags.map(([name, count]) => (
            <Badge key={name} variant="secondary" className="gap-2 py-1">
              {name}
              <span className="tabular text-muted-foreground">{count}</span>
            </Badge>
          ))}
        </Card>
      )}
    </SettingsPage>
  );
}
