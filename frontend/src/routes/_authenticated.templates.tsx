import { createFileRoute } from "@tanstack/react-router";
import { Templates } from "@/features/templates/Templates";

export const Route = createFileRoute("/_authenticated/templates")({
  head: () => ({
    meta: [
      { title: "Templates — Konvo" },
      { name: "description", content: "Pre-approved messages ready to send." },
      { property: "og:title", content: "Templates — Konvo" },
      {
        property: "og:description",
        content: "Pre-approved messages ready to send.",
      },
    ],
  }),
  component: Templates,
});
