import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
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

export function CustomFields() {
  const q = useQuery({
    queryKey: ["contacts", { pageSize: 50 }],
    queryFn: () => api.contacts.list({ pageSize: 50 }),
  });

  const fields = useMemo(() => {
    const labels = new Map<string, number>();
    for (const c of q.data?.items ?? []) {
      for (const f of c.customFields) {
        labels.set(f.label, (labels.get(f.label) ?? 0) + 1);
      }
    }
    return [...labels.entries()].map(([label, used]) => ({ label, used }));
  }, [q.data]);

  return (
    <SettingsPage
      title="Custom Fields"
      description="Extra attributes stored on contacts (JSON on the backend)."
    >
      {q.isPending ? (
        <ListSkeleton rows={3} />
      ) : q.isError ? (
        <ErrorState onRetry={() => q.refetch()} />
      ) : fields.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="No custom fields"
            description="Fields appear here once contacts have extra attributes."
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Contacts using it</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((f) => (
                <TableRow key={f.label}>
                  <TableCell className="font-medium">{f.label}</TableCell>
                  <TableCell className="tabular">{f.used}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </SettingsPage>
  );
}
