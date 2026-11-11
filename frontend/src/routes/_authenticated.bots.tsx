import { createFileRoute } from "@tanstack/react-router";
import { Workflow } from "lucide-react";
import { ComingSoon } from "@/features/placeholder/ComingSoon";

export const Route = createFileRoute("/_authenticated/bots")({
  head: () => ({
    meta: [
      { title: "Bots — Konvo" },
      {
        name: "description",
        content: "Automatic replies for common questions.",
      },
      { property: "og:title", content: "Bots — Konvo" },
      {
        property: "og:description",
        content: "Automatic replies for common questions.",
      },
    ],
  }),
  component: () => (
    <ComingSoon
      title="Bots"
      description="Automatic replies for common questions."
      icon={Workflow}
      emptyTitle="Nothing here yet"
      emptyText="Automatic replies for common questions."
      cta="Get started"
    />
  ),
});
