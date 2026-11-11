import { createFileRoute } from "@tanstack/react-router";
import { Bots } from "@/features/bots/Bots";

export const Route = createFileRoute("/_authenticated/bots")({
  head: () => ({
    meta: [
      { title: "Bots — Konvo" },
      { name: "description", content: "Automation rules that reply to customers." },
      { property: "og:title", content: "Bots — Konvo" },
      { property: "og:description", content: "Automation rules that reply to customers." },
    ],
  }),
  component: Bots,
});
