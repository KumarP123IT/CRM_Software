import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SettingsPage } from "./SettingsPage";

export function Security() {
  const [twoFa, setTwoFa] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");

  return (
    <SettingsPage
      title="Security"
      description="Password and two-factor authentication for your Konvo account."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 font-semibold">Password</h2>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Password updated");
              setCurrent("");
              setNext("");
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="current-pw">Current password</Label>
              <Input
                id="current-pw"
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pw">New password</Label>
              <Input
                id="new-pw"
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <Button type="submit">Update password</Button>
          </form>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold">Two-factor authentication</h2>
              <p className="text-sm text-muted-foreground">
                Require an authenticator code at sign-in.
              </p>
            </div>
            <Switch
              checked={twoFa}
              onCheckedChange={(v) => {
                setTwoFa(v);
                toast.success(v ? "2FA turned on" : "2FA turned off");
              }}
              aria-label="Two-factor authentication"
            />
          </div>
        </Card>
      </div>
    </SettingsPage>
  );
}
