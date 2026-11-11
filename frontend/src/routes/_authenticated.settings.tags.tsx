import { createFileRoute } from "@tanstack/react-router";
import { Tags } from "@/features/settings/Tags";

export const Route = createFileRoute("/_authenticated/settings/tags")({
  head: () => ({
    meta: [
      { title: "Tags — Konvo" },
      { name: "description", content: "Labels used across contacts and chats." },
      { property: "og:title", content: "Tags — Konvo" },
      { property: "og:description", content: "Labels used across contacts and chats." },
    ],
  }),
  component: Tags,
});
