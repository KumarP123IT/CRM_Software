import { createFileRoute } from "@tanstack/react-router";
import { DesignSystem } from "@/features/design/DesignSystem";

export const Route = createFileRoute("/_authenticated/design")({
  head: () => ({
    meta: [
      { title: "Design system — Konvo" },
      { name: "description", content: "Every component and state." },
      { property: "og:title", content: "Design system — Konvo" },
      { property: "og:description", content: "Every component and state." },
    ],
  }),
  component: DesignSystem,
});
