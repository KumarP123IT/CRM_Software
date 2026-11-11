import { createFileRoute } from "@tanstack/react-router";
import { Calls } from "@/features/calls/Calls";

export const Route = createFileRoute("/_authenticated/calls")({
  head: () => ({
    meta: [
      { title: "Calls — Konvo" },
      { name: "description", content: "Call reminders and history." },
      { property: "og:title", content: "Calls — Konvo" },
      { property: "og:description", content: "Call reminders and history." },
    ],
  }),
  component: Calls,
});
