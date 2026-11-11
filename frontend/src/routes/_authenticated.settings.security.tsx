import { createFileRoute } from "@tanstack/react-router";
import { Security } from "@/features/settings/Security";

export const Route = createFileRoute("/_authenticated/settings/security")({
  head: () => ({
    meta: [
      { title: "Security — Konvo" },
      { name: "description", content: "Password and two-factor authentication." },
      { property: "og:title", content: "Security — Konvo" },
      { property: "og:description", content: "Password and two-factor authentication." },
    ],
  }),
  component: Security,
});
