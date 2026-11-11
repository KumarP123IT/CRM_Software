import { createFileRoute } from "@tanstack/react-router";
import { Groups } from "@/features/groups/Groups";

export const Route = createFileRoute("/_authenticated/groups")({
  head: () => ({
    meta: [
      { title: "Groups — Konvo" },
      {
        name: "description",
        content: "Organise contacts into groups you can message together.",
      },
      { property: "og:title", content: "Groups — Konvo" },
      {
        property: "og:description",
        content: "Organise contacts into groups you can message together.",
      },
    ],
  }),
  component: Groups,
});
