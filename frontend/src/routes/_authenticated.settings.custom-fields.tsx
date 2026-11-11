import { createFileRoute } from "@tanstack/react-router";
import { CustomFields } from "@/features/settings/CustomFields";

export const Route = createFileRoute("/_authenticated/settings/custom-fields")({
  head: () => ({
    meta: [
      { title: "Custom Fields — Konvo" },
      { name: "description", content: "Extra attributes stored on contacts." },
      { property: "og:title", content: "Custom Fields — Konvo" },
      { property: "og:description", content: "Extra attributes stored on contacts." },
    ],
  }),
  component: CustomFields,
});
