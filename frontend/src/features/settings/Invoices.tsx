import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared";
import { SettingsPage } from "./SettingsPage";

const INVOICES = [
  { id: "INV-2026-010", date: "1 Oct 2026", amount: "₹2,499", status: "Paid" },
  { id: "INV-2026-009", date: "1 Sep 2026", amount: "₹2,499", status: "Paid" },
  { id: "INV-2026-008", date: "1 Aug 2026", amount: "₹2,499", status: "Paid" },
];

export function Invoices() {
  return (
    <SettingsPage
      title="Invoices"
      description="GST invoices for this workspace. Amounts are in INR."
    >
      {INVOICES.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="No invoices yet"
            description="Invoices appear here after the first paid cycle."
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {INVOICES.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.id}</TableCell>
                  <TableCell>{inv.date}</TableCell>
                  <TableCell className="tabular">{inv.amount}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{inv.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </SettingsPage>
  );
}
