import { PageHeader } from "@/components/shared";
import { EmptyState } from "@/components/shared";
import { Users } from "lucide-react";

export function Team() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description="Manage team members, roles, and permissions."
      />
      <EmptyState
        icon={Users}
        title="Team management coming soon"
        description="Invite team members and manage their roles."
      />
    </div>
  );
}
