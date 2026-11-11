import { PageHeader } from "@/components/shared";
import { EmptyState } from "@/components/shared";
import { CreditCard } from "lucide-react";

export function Billing() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Manage your subscription, invoices, and payment methods."
      />
      <EmptyState
        icon={CreditCard}
        title="Billing coming soon"
        description="View invoices, upgrade your plan, and manage payment methods."
      />
    </div>
  );
}
