import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "@/features/settings/Settings";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Konvo" },
      { name: "description", content: "Workspace, team and billing." },
      { property: "og:title", content: "Settings — Konvo" },
      { property: "og:description", content: "Workspace, team and billing." },
    ],
  }),
  component: Settings,
});
