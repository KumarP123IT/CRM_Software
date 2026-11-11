import { createFileRoute } from "@tanstack/react-router";
import { WebsiteWidget } from "@/features/settings/WebsiteWidget";

export const Route = createFileRoute("/_authenticated/settings/widget")({
  head: () => ({
    meta: [
      { title: "Website Chat Widget — Konvo" },
      { name: "description", content: "Embed Konvo chat on your website." },
      { property: "og:title", content: "Website Chat Widget — Konvo" },
      { property: "og:description", content: "Embed Konvo chat on your website." },
    ],
  }),
  component: WebsiteWidget,
});
