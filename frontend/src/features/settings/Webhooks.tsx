import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared";
import { SettingsPage } from "./SettingsPage";

interface Hook {
  id: string;
  url: string;
  events: string;
}

export function Webhooks() {
  const [hooks, setHooks] = useState<Hook[]>([
    {
      id: "wh1",
      url: "https://example.in/hooks/konvo",
      events: "message.created, conversation.assigned",
    },
  ]);
  const [url, setUrl] = useState("");

  return (
    <SettingsPage
      title="Webhooks"
      description="HTTPS endpoints Konvo will POST signed events to. Delivery retries ship in a later phase."
    >
      <Card className="p-6">
        <form
          className="mb-6 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            setHooks((h) => [...h, { id: `wh${h.length + 1}`, url, events: "message.created" }]);
            setUrl("");
            toast.success("Webhook added");
          }}
        >
          <div className="flex-1 space-y-2">
            <Label htmlFor="hook-url">Endpoint URL</Label>
            <Input
              id="hook-url"
              type="url"
              required
              placeholder="https://"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <Button type="submit">
            <Plus className="size-4" />
            Add
          </Button>
        </form>
        {hooks.length === 0 ? (
          <EmptyState
            icon={Plus}
            title="No webhooks"
            description="Add an HTTPS URL to receive conversation events."
            className="py-8"
          />
        ) : (
          <ul className="space-y-3">
            {hooks.map((h) => (
              <li
                key={h.id}
                className="flex items-start justify-between gap-3 rounded-md border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{h.url}</p>
                  <p className="text-sm text-muted-foreground">{h.events}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${h.url}`}
                  onClick={() => setHooks((list) => list.filter((x) => x.id !== h.id))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </SettingsPage>
  );
}
