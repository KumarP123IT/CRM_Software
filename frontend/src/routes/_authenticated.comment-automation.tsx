import { createFileRoute } from "@tanstack/react-router";
import { MessageCircleReply } from "lucide-react";
import { ComingSoon } from "@/features/placeholder/ComingSoon";

export const Route = createFileRoute("/_authenticated/comment-automation")({
  head: () => ({
    meta: [
      { title: "Comment Automation — Konvo" },
      {
        name: "description",
        content: "Reply to Instagram comments on WhatsApp.",
      },
      { property: "og:title", content: "Comment Automation — Konvo" },
      {
        property: "og:description",
        content: "Reply to Instagram comments on WhatsApp.",
      },
    ],
  }),
  component: () => (
    <ComingSoon
      title="Comment Automation"
      description="Reply to Instagram comments on WhatsApp."
      icon={MessageCircleReply}
      emptyTitle="Nothing here yet"
      emptyText="Reply to Instagram comments on WhatsApp."
      cta="Get started"
    />
  ),
});
