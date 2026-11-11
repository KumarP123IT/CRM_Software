import { createFileRoute } from "@tanstack/react-router";
import { Notifications } from "@/features/settings/Notifications";

export const Route = createFileRoute("/_authenticated/settings/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Konvo" },
      { name: "description", content: "Email, desktop and mention alerts." },
      { property: "og:title", content: "Notifications — Konvo" },
      { property: "og:description", content: "Email, desktop and mention alerts." },
    ],
  }),
  component: Notifications,
});
