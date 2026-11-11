import { createFileRoute } from "@tanstack/react-router";
import { PhoneCall } from "lucide-react";
import { ComingSoon } from "@/features/placeholder/ComingSoon";

export const Route = createFileRoute("/_authenticated/calls")({
  head: () => ({
    meta: [
      { title: "Calls — Konvo" },
      { name: "description", content: "Call reminders and history." },
      { property: "og:title", content: "Calls — Konvo" },
      { property: "og:description", content: "Call reminders and history." },
    ],
  }),
  component: () => (
    <ComingSoon
      title="Calls"
      description="Call reminders and history."
      icon={PhoneCall}
      emptyTitle="Nothing here yet"
      emptyText="Call reminders and history."
      cta="Get started"
    />
  ),
});
