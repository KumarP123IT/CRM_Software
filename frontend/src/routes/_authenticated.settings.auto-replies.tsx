import { createFileRoute } from "@tanstack/react-router";
import { AutoReplies } from "@/features/settings/AutoReplies";

export const Route = createFileRoute("/_authenticated/settings/auto-replies")({
  head: () => ({
    meta: [
      { title: "Auto-Replies — Konvo" },
      { name: "description", content: "After-hours and welcome messages." },
      { property: "og:title", content: "Auto-Replies — Konvo" },
      { property: "og:description", content: "After-hours and welcome messages." },
    ],
  }),
  component: AutoReplies,
});
