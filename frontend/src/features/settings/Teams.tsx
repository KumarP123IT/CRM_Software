import { useQuery } from "@tanstack/react-query";
import { UsersRound } from "lucide-react";
import { api } from "@/api";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/shared";
import { SettingsPage } from "./SettingsPage";

export function Teams() {
  const q = useQuery({ queryKey: ["teams"], queryFn: () => api.team.teams() });
  const teams = q.data ?? [];

  return (
    <SettingsPage
      title="Teams"
      description="Groups used to assign conversations (front of house, catering, and so on)."
    >
      {q.isPending ? (
        <ListSkeleton rows={3} />
      ) : q.isError ? (
        <ErrorState onRetry={() => q.refetch()} />
      ) : teams.length === 0 ? (
        <Card>
          <EmptyState
            icon={UsersRound}
            title="No teams"
            description="Create a team so chats can be transferred as a group."
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="text-muted-foreground">{t.id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </SettingsPage>
  );
}
