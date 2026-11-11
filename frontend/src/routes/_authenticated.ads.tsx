import { createFileRoute } from "@tanstack/react-router";
import { BadgeIndianRupee } from "lucide-react";
import { ComingSoon } from "@/features/placeholder/ComingSoon";

export const Route = createFileRoute("/_authenticated/ads")({
  head: () => ({
    meta: [
      { title: "Ads — Konvo" },
      { name: "description", content: "Ads that open a WhatsApp chat." },
      { property: "og:title", content: "Ads — Konvo" },
      { property: "og:description", content: "Ads that open a WhatsApp chat." },
    ],
  }),
  component: () => (
    <ComingSoon
      title="Ads"
      description="Ads that open a WhatsApp chat."
      icon={BadgeIndianRupee}
      emptyTitle="Nothing here yet"
      emptyText="Ads that open a WhatsApp chat."
      cta="Get started"
    />
  ),
});
