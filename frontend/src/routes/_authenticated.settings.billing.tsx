import { createFileRoute } from "@tanstack/react-router";
import { Billing } from "@/features/settings/Billing";

export const Route = createFileRoute("/_authenticated/settings/billing")({
  head: () => ({
    meta: [
      { title: "Subscription — Konvo" },
      { name: "description", content: "Plan and billing cycle in INR." },
      { property: "og:title", content: "Subscription — Konvo" },
      { property: "og:description", content: "Plan and billing cycle in INR." },
    ],
  }),
  component: Billing,
});
