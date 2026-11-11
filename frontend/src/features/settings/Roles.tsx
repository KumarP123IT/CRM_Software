import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROLE_LABEL, ROLE_PERMISSIONS, type Permission } from "@/lib/permissions";
import type { Role } from "@/api/types";
import { SettingsPage } from "./SettingsPage";

const ROLES: Role[] = ["owner", "admin", "manager", "agent", "readonly"];
const ALL_PERMS: Permission[] = [
  "conversation.reply",
  "conversation.assign",
  "contact.create",
  "contact.delete",
  "broadcast.create",
  "template.create",
  "lead.edit",
  "bot.edit",
  "ai.configure",
  "ads.manage",
  "analytics.view",
  "settings.manage",
  "billing.manage",
  "team.invite",
];

export function Roles() {
  return (
    <SettingsPage
      title="Roles"
      description="What each workspace role can do. Backend enforcement ships in a later phase; this matrix is the product contract."
    >
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Permission</TableHead>
              {ROLES.map((r) => (
                <TableHead key={r}>{ROLE_LABEL[r]}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {ALL_PERMS.map((perm) => (
              <TableRow key={perm}>
                <TableCell className="font-mono text-xs">{perm}</TableCell>
                {ROLES.map((r) => (
                  <TableCell key={r}>{ROLE_PERMISSIONS[r].includes(perm) ? "Yes" : "—"}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </SettingsPage>
  );
}
