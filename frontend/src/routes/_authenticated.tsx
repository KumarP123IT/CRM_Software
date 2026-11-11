import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { ready } = useAuthGuard();
  if (!ready) {
    return (
      <div className="flex min-h-screen">
        <div className="hidden w-[248px] border-r bg-sidebar p-3 md:block">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex-1 p-8 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }
  return <AppShell />;
}
