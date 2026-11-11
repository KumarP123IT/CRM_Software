import { PageHeader } from "@/components/shared";
import { EmptyState } from "@/components/shared";
import { Bell } from "lucide-react";

export function Notifications() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Configure your notification preferences and channels."
      />
      <EmptyState
        icon={Bell}
        title="Notifications coming soon"
        description="Manage email, push, and in-app notification preferences."
      />
    </div>
  );
}
