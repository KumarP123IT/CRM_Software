import { createFileRoute } from "@tanstack/react-router";
import { Analytics } from "@/features/analytics/Analytics";

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
  component: Analytics,
});
