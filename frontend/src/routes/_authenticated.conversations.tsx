import { createFileRoute } from "@tanstack/react-router";
import { Inbox } from "@/features/inbox/Inbox";

export const Route = createFileRoute("/_authenticated/conversations")({
  head: () => ({
    meta: [
      { title: "Inbox — Konvo" },
      {
        name: "description",
        content: "Every conversation across your connected channels in one shared inbox.",
      },
      { property: "og:title", content: "Inbox — Konvo" },
      {
        property: "og:description",
        content: "Every conversation across your connected channels in one shared inbox.",
      },
    ],
  }),
  component: Inbox,
});
