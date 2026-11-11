import { createFileRoute } from "@tanstack/react-router";
import { Teams } from "@/features/settings/Teams";

export const Route = createFileRoute("/_authenticated/settings/teams")({
  head: () => ({
    meta: [
      { title: "Teams — Konvo" },
      { name: "description", content: "Conversation assignment groups." },
      { property: "og:title", content: "Teams — Konvo" },
      { property: "og:description", content: "Conversation assignment groups." },
    ],
  }),
  component: Teams,
});
