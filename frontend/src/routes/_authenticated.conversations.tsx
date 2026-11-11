import { createFileRoute } from "@tanstack/react-router";
import { MessagesSquare } from "lucide-react";
import { ComingSoon } from "@/features/placeholder/ComingSoon";

export const Route = createFileRoute("/_authenticated/conversations")({
  head: () => ({
    meta: [
      { title: "Conversations — Konvo" },
      {
        name: "description",
        content: "Every WhatsApp chat in one shared inbox.",
      },
      { property: "og:title", content: "Conversations — Konvo" },
      {
        property: "og:description",
        content: "Every WhatsApp chat in one shared inbox.",
      },
    ],
  }),
  component: () => (
    <ComingSoon
      title="Conversations"
      description="Every WhatsApp chat in one shared inbox."
      icon={MessagesSquare}
      emptyTitle="Nothing here yet"
      emptyText="Every WhatsApp chat in one shared inbox."
      cta="Get started"
    />
  ),
});
