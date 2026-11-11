import { createFileRoute } from "@tanstack/react-router";
import { Workspaces } from "@/features/settings/Workspaces";

export const Route = createFileRoute("/_authenticated/settings/workspaces")({
  head: () => ({
    meta: [
      { title: "My Workspaces — Konvo" },
      { name: "description", content: "Switch between businesses you belong to." },
      { property: "og:title", content: "My Workspaces — Konvo" },
      { property: "og:description", content: "Switch between businesses you belong to." },
    ],
  }),
  component: Workspaces,
});
