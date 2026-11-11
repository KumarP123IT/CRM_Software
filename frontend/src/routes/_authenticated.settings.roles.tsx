import { createFileRoute } from "@tanstack/react-router";
import { Roles } from "@/features/settings/Roles";

export const Route = createFileRoute("/_authenticated/settings/roles")({
  head: () => ({
    meta: [
      { title: "Roles — Konvo" },
      { name: "description", content: "Role permission matrix for this workspace." },
      { property: "og:title", content: "Roles — Konvo" },
      { property: "og:description", content: "Role permission matrix for this workspace." },
    ],
  }),
  component: Roles,
});
