import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceSecurity } from "@/features/settings/WorkspaceSecurity";

export const Route = createFileRoute("/_authenticated/settings/workspace-security")({
  head: () => ({
    meta: [
      { title: "Workspace Security — Konvo" },
      { name: "description", content: "2FA policy and active sessions." },
      { property: "og:title", content: "Workspace Security — Konvo" },
      { property: "og:description", content: "2FA policy and active sessions." },
    ],
  }),
  component: WorkspaceSecurity,
});
