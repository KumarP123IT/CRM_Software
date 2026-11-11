import { createFileRoute } from "@tanstack/react-router";
import { BusinessHours } from "@/features/settings/BusinessHours";

export const Route = createFileRoute("/_authenticated/settings/business-hours")({
  head: () => ({
    meta: [
      { title: "Business Hours — Konvo" },
      { name: "description", content: "When your team is available in IST." },
      { property: "og:title", content: "Business Hours — Konvo" },
      { property: "og:description", content: "When your team is available in IST." },
    ],
  }),
  component: BusinessHours,
});
