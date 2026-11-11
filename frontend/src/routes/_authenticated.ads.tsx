import { createFileRoute } from "@tanstack/react-router";
import { BadgeIndianRupee } from "lucide-react";
import { Ads } from "@/features/ads/Ads";

export const Route = createFileRoute("/_authenticated/ads")({
  head: () => ({
    meta: [
      { title: "Ads — Konvo" },
      { name: "description", content: "Ads that open a WhatsApp chat." },
      { property: "og:title", content: "Ads — Konvo" },
      { property: "og:description", content: "Ads that open a WhatsApp chat." },
    ],
  }),
  component: Ads,
});
