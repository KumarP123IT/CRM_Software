import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SettingsPage } from "./SettingsPage";

export function WebsiteWidget() {
  const [enabled, setEnabled] = useState(false);
  const [color, setColor] = useState("#0F766E");
  const snippet = `<script src="https://cdn.konvo.app/widget.js" data-workspace="chai-point-cafe"></script>`;

  return (
    <SettingsPage
      title="Website Chat Widget"
      description="Embed a Konvo chat launcher on your website. Visitors land in the shared inbox."
    >
      <Card className="max-w-xl space-y-5 p-6">
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Widget settings saved");
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="widget-on">Enable widget</Label>
            <Switch id="widget-on" checked={enabled} onCheckedChange={setEnabled} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="widget-color">Launcher colour</Label>
            <Input
              id="widget-color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              disabled={!enabled}
              className="h-10 w-20 p-1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="snippet">Install snippet</Label>
            <Textarea
              id="snippet"
              readOnly
              value={snippet}
              rows={3}
              className="font-mono text-xs"
            />
          </div>
          <Button type="submit">Save widget</Button>
        </form>
      </Card>
    </SettingsPage>
  );
}
