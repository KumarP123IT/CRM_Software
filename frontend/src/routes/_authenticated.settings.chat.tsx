import { createFileRoute } from "@tanstack/react-router";
import { ChatSettings } from "@/features/settings/ChatSettings";

export const Route = createFileRoute("/_authenticated/settings/chat")({
  head: () => ({
    meta: [
      { title: "Chat Settings — Konvo" },
      { name: "description", content: "Assignment, sound and SLA for the inbox." },
      { property: "og:title", content: "Chat Settings — Konvo" },
      { property: "og:description", content: "Assignment, sound and SLA for the inbox." },
    ],
  }),
  component: ChatSettings,
});
