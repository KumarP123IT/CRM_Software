import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SettingsPage } from "./SettingsPage";

export function AutoReplies() {
  const [afterHours, setAfterHours] = useState(true);
  const [firstMessage, setFirstMessage] = useState(true);
  const [afterHoursText, setAfterHoursText] = useState(
    "Thanks for messaging us. Our team is offline (IST). We'll reply when we're back.",
  );
  const [welcomeText, setWelcomeText] = useState(
    "Hi! Welcome to our WhatsApp. How can we help you today?",
  );

  return (
    <SettingsPage
      title="Auto-Replies"
      description="Messages sent automatically outside business hours or on a customer's first message."
    >
      <Card className="p-6">
        <form
          className="max-w-xl space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Auto-replies saved");
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="after-hours">After-hours reply</Label>
            <Switch id="after-hours" checked={afterHours} onCheckedChange={setAfterHours} />
          </div>
          <Textarea
            value={afterHoursText}
            disabled={!afterHours}
            onChange={(e) => setAfterHoursText(e.target.value)}
            rows={4}
          />
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="welcome">First-message welcome</Label>
            <Switch id="welcome" checked={firstMessage} onCheckedChange={setFirstMessage} />
          </div>
          <Textarea
            value={welcomeText}
            disabled={!firstMessage}
            onChange={(e) => setWelcomeText(e.target.value)}
            rows={4}
          />
          <Button type="submit">Save auto-replies</Button>
        </form>
      </Card>
    </SettingsPage>
  );
}
