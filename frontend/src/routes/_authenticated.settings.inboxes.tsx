import { createFileRoute } from "@tanstack/react-router";
import { Inboxes } from "@/features/settings/Inboxes";

export const Route = createFileRoute("/_authenticated/settings/inboxes")({
  head: () => ({
    meta: [
      { title: "Inboxes — Konvo" },
      { name: "description", content: "Connect and manage your WhatsApp Business numbers." },
      { property: "og:title", content: "Inboxes — Konvo" },
      { property: "og:description", content: "Connect and manage your WhatsApp Business numbers." },
    ],
  }),
  component: Inboxes,
});
