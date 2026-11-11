import { createFileRoute } from "@tanstack/react-router";
import { Broadcasts } from "@/features/broadcasts/Broadcasts";

export const Route = createFileRoute("/_authenticated/broadcasts")({
  head: () => ({
    meta: [
      { title: "Broadcasts — Konvo" },
      {
        name: "description",
        content: "Send one message to everyone in a group.",
      },
      { property: "og:title", content: "Broadcasts — Konvo" },
      {
        property: "og:description",
        content: "Send one message to everyone in a group.",
      },
    ],
  }),
  component: Broadcasts,
});
