import { createFileRoute } from "@tanstack/react-router";
import { Team } from "@/features/settings/Team";

export const Route = createFileRoute("/_authenticated/settings/team")({
  head: () => ({
    meta: [
      { title: "Members — Konvo" },
      { name: "description", content: "Invite teammates and manage roles." },
      { property: "og:title", content: "Members — Konvo" },
      { property: "og:description", content: "Invite teammates and manage roles." },
    ],
  }),
  component: Team,
});
