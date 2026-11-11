import { createFileRoute } from "@tanstack/react-router";
import { Leads } from "@/features/leads/Leads";

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
  component: Leads,
});
