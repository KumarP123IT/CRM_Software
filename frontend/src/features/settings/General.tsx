import { PageHeader } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function General() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="General Settings"
        description="Manage your workspace identity and regional settings."
      />

      <Card className="p-6">
        <div className="space-y-4 max-w-lg">
          <div className="space-y-2">
            <Label htmlFor="workspace-name">Workspace name</Label>
            <Input id="workspace-name" defaultValue="Chai Point Café" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Workspace URL</Label>
            <div className="flex items-center">
              <span className="mr-2 text-sm text-muted-foreground">konvo.app/</span>
              <Input id="slug" defaultValue="chai-point-cafe" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input id="timezone" defaultValue="Asia/Kolkata (IST)" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Input id="language" defaultValue="English" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" defaultValue="India" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" defaultValue="INR (₹)" />
          </div>
          <Button>Save changes</Button>
        </div>
      </Card>
    </div>
  );
}
