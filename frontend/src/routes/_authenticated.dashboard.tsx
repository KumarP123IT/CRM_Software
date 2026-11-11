import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/features/dashboard/Dashboard";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Konvo" },
      { name: "description", content: "Your day at a glance." },
      { property: "og:title", content: "Dashboard — Konvo" },
      { property: "og:description", content: "Your day at a glance." },
    ],
  }),
  component: Dashboard,
});
