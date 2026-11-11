import { createFileRoute } from "@tanstack/react-router";
import { General } from "@/features/settings/General";

export const Route = createFileRoute("/_authenticated/settings/")({
  head: () => ({
    meta: [
      { title: "Workspace — Konvo" },
      { name: "description", content: "Workspace identity and regional settings." },
      { property: "og:title", content: "Workspace — Konvo" },
      { property: "og:description", content: "Workspace identity and regional settings." },
    ],
  }),
  component: General,
});
