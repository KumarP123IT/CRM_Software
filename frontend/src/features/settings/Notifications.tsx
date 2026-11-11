import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SettingsPage } from "./SettingsPage";

export function Notifications() {
  const [email, setEmail] = useState(true);
  const [desktop, setDesktop] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [broadcasts, setBroadcasts] = useState(false);

  return (
    <SettingsPage
      title="Notifications"
      description="Choose how Konvo reaches you about chats, mentions and broadcasts."
    >
      <Card className="p-6">
        <form
          className="max-w-lg space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Notification preferences saved");
          }}
        >
          {(
            [
              ["email", "Email", "Digest and assignment emails", email, setEmail],
              [
                "desktop",
                "Desktop",
                "Browser notifications while Konvo is open",
                desktop,
                setDesktop,
              ],
              [
                "mentions",
                "Mentions",
                "When a teammate @mentions you in a note",
                mentions,
                setMentions,
              ],
              [
                "broadcasts",
                "Broadcasts",
                "Delivery and failure alerts for campaigns you own",
                broadcasts,
                setBroadcasts,
              ],
            ] as const
          ).map(([id, label, hint, value, set]) => (
            <div key={id} className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor={id}>{label}</Label>
                <p className="text-sm text-muted-foreground">{hint}</p>
              </div>
              <Switch id={id} checked={value} onCheckedChange={set} />
            </div>
          ))}
          <Button type="submit">Save notifications</Button>
        </form>
      </Card>
    </SettingsPage>
  );
}
