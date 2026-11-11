import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SettingsPage } from "./SettingsPage";

const SESSIONS = [
  { id: "s1", device: "Chrome · Bengaluru", last: "Just now", current: true },
  { id: "s2", device: "Safari · iPhone", last: "2 hours ago", current: false },
];

export function WorkspaceSecurity() {
  const [require2fa, setRequire2fa] = useState(false);
  const [sso, setSso] = useState(false);

  return (
    <SettingsPage
      title="Workspace Security"
      description="Policies that apply to every member of this workspace."
    >
      <Card className="mb-4 space-y-5 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="req-2fa">Require 2FA</Label>
            <p className="text-sm text-muted-foreground">
              Members must enable two-factor authentication.
            </p>
          </div>
          <Switch id="req-2fa" checked={require2fa} onCheckedChange={setRequire2fa} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="sso">Google Workspace SSO</Label>
            <p className="text-sm text-muted-foreground">
              Restrict sign-in to your company domain.
            </p>
          </div>
          <Switch id="sso" checked={sso} onCheckedChange={setSso} />
        </div>
        <Button onClick={() => toast.success("Workspace security saved")}>Save policies</Button>
      </Card>
      <Card className="overflow-hidden">
        <h2 className="border-b px-4 py-3 font-semibold">Active sessions</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device</TableHead>
              <TableHead>Last active</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {SESSIONS.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  {s.device}
                  {s.current ? " · this device" : ""}
                </TableCell>
                <TableCell>{s.last}</TableCell>
                <TableCell>
                  {!s.current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toast.success("Session revoked")}
                    >
                      Revoke
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </SettingsPage>
  );
}
