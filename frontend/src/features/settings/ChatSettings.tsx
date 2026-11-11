import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SettingsPage } from "./SettingsPage";

export function ChatSettings() {
  const [autoAssign, setAutoAssign] = useState(true);
  const [sound, setSound] = useState(true);
  const [slaMins, setSlaMins] = useState("15");

  return (
    <SettingsPage
      title="Chat Settings"
      description="How conversations are assigned, notified and measured in the inbox."
    >
      <Card className="p-6">
        <form
          className="max-w-lg space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Chat settings saved");
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="auto-assign">Auto-assign new chats</Label>
              <p className="text-sm text-muted-foreground">Round-robin among online agents.</p>
            </div>
            <Switch id="auto-assign" checked={autoAssign} onCheckedChange={setAutoAssign} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="sound">Sound on new message</Label>
              <p className="text-sm text-muted-foreground">Desktop notification tone.</p>
            </div>
            <Switch id="sound" checked={sound} onCheckedChange={setSound} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sla">First-response SLA (minutes)</Label>
            <Input
              id="sla"
              type="number"
              min={1}
              value={slaMins}
              onChange={(e) => setSlaMins(e.target.value)}
            />
          </div>
          <Button type="submit">Save chat settings</Button>
        </form>
      </Card>
    </SettingsPage>
  );
}
