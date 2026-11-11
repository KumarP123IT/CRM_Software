import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useAuth } from "@/stores/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorState, ListSkeleton } from "@/components/shared";
import { Guarded } from "@/components/shared";
import { toast } from "sonner";
import { SettingsPage } from "./SettingsPage";

const PLANS = [
  { name: "Starter" as const, price: "₹999 / month", seats: "3 seats" },
  { name: "Growth" as const, price: "₹2,499 / month", seats: "10 seats" },
  { name: "Pro" as const, price: "₹6,999 / month", seats: "Unlimited seats" },
];

export function Billing() {
  const workspaceId = useAuth((s) => s.workspaceId);
  const q = useQuery({
    queryKey: ["workspaces"],
    queryFn: () => api.workspaces.list(),
  });
  const current = q.data?.find((w) => w.id === workspaceId) ?? q.data?.[0];

  return (
    <SettingsPage
      title="Subscription"
      description="Plan and billing cycle for this workspace. Amounts are in INR."
    >
      {q.isPending ? (
        <ListSkeleton rows={3} />
      ) : q.isError ? (
        <ErrorState onRetry={() => q.refetch()} />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => {
            const active = current?.plan === plan.name;
            return (
              <Card key={plan.name} className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">{plan.name}</h2>
                  {active && <Badge>Current</Badge>}
                </div>
                <p className="text-2xl font-bold tabular">{plan.price}</p>
                <p className="text-sm text-muted-foreground">{plan.seats}</p>
                <Guarded perm="billing.manage">
                  <Button
                    variant={active ? "secondary" : "default"}
                    disabled={active}
                    onClick={() =>
                      toast.success(`${plan.name} selected — confirm on the next invoice`)
                    }
                  >
                    {active ? "Current plan" : "Switch plan"}
                  </Button>
                </Guarded>
              </Card>
            );
          })}
        </div>
      )}
    </SettingsPage>
  );
}
