import { createFileRoute } from "@tanstack/react-router";
import { Campaigns } from "@/features/campaigns/Campaigns";

export const Route = createFileRoute("/_authenticated/campaigns")({
  head: () => ({
    meta: [
      { title: "Campaigns — Konvo" },
      { name: "description", content: "Group broadcasts into coordinated marketing pushes." },
      { property: "og:title", content: "Campaigns — Konvo" },
      {
        property: "og:description",
        content: "Group broadcasts into coordinated marketing pushes.",
      },
    ],
  }),
  component: Campaigns,
});
