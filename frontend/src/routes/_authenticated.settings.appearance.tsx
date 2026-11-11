import { createFileRoute } from "@tanstack/react-router";
import { Appearance } from "@/features/settings/Appearance";

export const Route = createFileRoute("/_authenticated/settings/appearance")({
  head: () => ({
    meta: [
      { title: "Appearance — Konvo" },
      { name: "description", content: "Light, dark or system theme." },
      { property: "og:title", content: "Appearance — Konvo" },
      { property: "og:description", content: "Light, dark or system theme." },
    ],
  }),
  component: Appearance,
});
