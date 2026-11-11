import { createFileRoute } from "@tanstack/react-router";
import { Rocket } from "lucide-react";
import { ComingSoon } from "@/features/placeholder/ComingSoon";

export const Route = createFileRoute("/_authenticated/campaigns")({
  head: () => ({
    meta: [
      { title: "Campaigns — Konvo" },
      { name: "description", content: "Plan a series of messages over time." },
      { property: "og:title", content: "Campaigns — Konvo" },
      {
        property: "og:description",
        content: "Plan a series of messages over time.",
      },
    ],
  }),
  component: () => (
    <ComingSoon
      title="Campaigns"
      description="Plan a series of messages over time."
      icon={Rocket}
      emptyTitle="Nothing here yet"
      emptyText="Plan a series of messages over time."
      cta="Get started"
    />
  ),
});
