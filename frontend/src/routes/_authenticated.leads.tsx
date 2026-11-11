import { createFileRoute } from "@tanstack/react-router";
import { Target } from "lucide-react";
import { ComingSoon } from "@/features/placeholder/ComingSoon";

export const Route = createFileRoute("/_authenticated/leads")({
  head: () => ({
    meta: [
      { title: "Leads — Konvo" },
      { name: "description", content: "Track deals from first hello to paid." },
      { property: "og:title", content: "Leads — Konvo" },
      {
        property: "og:description",
        content: "Track deals from first hello to paid.",
      },
    ],
  }),
  component: () => (
    <ComingSoon
      title="Leads"
      description="Track deals from first hello to paid."
      icon={Target}
      emptyTitle="Nothing here yet"
      emptyText="Track deals from first hello to paid."
      cta="Get started"
    />
  ),
});
