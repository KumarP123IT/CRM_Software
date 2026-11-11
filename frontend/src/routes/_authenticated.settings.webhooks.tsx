import { createFileRoute } from "@tanstack/react-router";
import { Webhooks } from "@/features/settings/Webhooks";

export const Route = createFileRoute("/_authenticated/settings/webhooks")({
  head: () => ({
    meta: [
      { title: "Webhooks — Konvo" },
      { name: "description", content: "Signed event delivery endpoints." },
      { property: "og:title", content: "Webhooks — Konvo" },
      { property: "og:description", content: "Signed event delivery endpoints." },
    ],
  }),
  component: Webhooks,
});
