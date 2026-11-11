// Ensure auth routes are imported for auto-discovery
import "./register";
import "./forgot-password";

import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Konvo — WhatsApp CRM" },
      {
        name: "description",
        content:
          "Your team's shared WhatsApp inbox, contacts, broadcasts and leads.",
      },
      { property: "og:title", content: "Konvo — WhatsApp CRM" },
      {
        property: "og:description",
        content:
          "Your team's shared WhatsApp inbox, contacts, broadcasts and leads.",
      },
    ],
  }),
});
