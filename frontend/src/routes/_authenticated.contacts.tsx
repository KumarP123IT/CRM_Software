import { createFileRoute } from "@tanstack/react-router";
import { Contacts } from "@/features/contacts/Contacts";

export const Route = createFileRoute("/_authenticated/contacts")({
  head: () => ({
    meta: [
      { title: "Contacts — Konvo" },
      {
        name: "description",
        content: "Everyone who has messaged your business.",
      },
      { property: "og:title", content: "Contacts — Konvo" },
      {
        property: "og:description",
        content: "Everyone who has messaged your business.",
      },
    ],
  }),
  component: Contacts,
});
