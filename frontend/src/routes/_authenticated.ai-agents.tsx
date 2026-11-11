import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { ComingSoon } from "@/features/placeholder/ComingSoon";

export const Route = createFileRoute("/_authenticated/ai-agents")({
  head: () => ({
    meta: [
      { title: "AI Agents — Konvo" },
      {
        name: "description",
        content: "Let AI answer customers in your voice.",
      },
      { property: "og:title", content: "AI Agents — Konvo" },
      {
        property: "og:description",
        content: "Let AI answer customers in your voice.",
      },
    ],
  }),
  component: () => (
    <ComingSoon
      title="AI Agents"
      description="Let AI answer customers in your voice."
      icon={Sparkles}
      emptyTitle="Nothing here yet"
      emptyText="Let AI answer customers in your voice."
      cta="Get started"
    />
  ),
});
