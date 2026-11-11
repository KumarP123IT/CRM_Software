import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState, Guarded, PageHeader } from "@/components/shared";
import type { Permission } from "@/lib/permissions";
import { toast } from "sonner";

export interface ComingSoonProps {
  title: string;
  description: string;
  icon: LucideIcon;
  emptyTitle: string;
  emptyText: string;
  cta: string;
  perm?: Permission;
}

/** Polished placeholder for sections not built yet. */
export function ComingSoon({
  title,
  description,
  icon,
  emptyTitle,
  emptyText,
  cta,
  perm,
}: ComingSoonProps) {
  const button = (
    <Button onClick={() => toast("This part is coming in the next update")}>
      {cta}
    </Button>
  );
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <Card>
        <EmptyState
          icon={icon}
          title={emptyTitle}
          description={emptyText}
          action={perm ? <Guarded perm={perm}>{button}</Guarded> : button}
        />
      </Card>
    </div>
  );
}
