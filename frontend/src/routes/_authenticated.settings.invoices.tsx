import { createFileRoute } from "@tanstack/react-router";
import { Invoices } from "@/features/settings/Invoices";

export const Route = createFileRoute("/_authenticated/settings/invoices")({
  head: () => ({
    meta: [
      { title: "Invoices — Konvo" },
      { name: "description", content: "GST invoices for this workspace." },
      { property: "og:title", content: "Invoices — Konvo" },
      { property: "og:description", content: "GST invoices for this workspace." },
    ],
  }),
  component: Invoices,
});
