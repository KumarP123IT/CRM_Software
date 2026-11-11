import { createFileRoute } from "@tanstack/react-router";
import { OpenAI } from "@/features/settings/OpenAI";

export const Route = createFileRoute("/_authenticated/settings/openai")({
  head: () => ({
    meta: [
      { title: "OpenAI — Konvo" },
      { name: "description", content: "Bring your own OpenAI key." },
      { property: "og:title", content: "OpenAI — Konvo" },
      { property: "og:description", content: "Bring your own OpenAI key." },
    ],
  }),
  component: OpenAI,
});
