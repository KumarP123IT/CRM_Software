import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { ComingSoon } from "@/features/placeholder/ComingSoon";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Konvo" },
      { name: "description", content: "How your team and messages are doing." },
      { property: "og:title", content: "Analytics — Konvo" },
      {
        property: "og:description",
        content: "How your team and messages are doing.",
      },
    ],
  }),
  component: () => (
    <ComingSoon
      title="Analytics"
      description="How your team and messages are doing."
      icon={BarChart3}
      emptyTitle="Nothing here yet"
      emptyText="How your team and messages are doing."
      cta="Get started"
    />
  ),
});
