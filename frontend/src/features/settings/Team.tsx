import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState, ErrorState, Guarded, ListSkeleton, PresenceAvatar } from "@/components/shared";
import { ROLE_LABEL, type Permission } from "@/lib/permissions";
import type { Role } from "@/api/types";
import { SettingsPage } from "./SettingsPage";

export function Team() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("agent");
  const q = useQuery({ queryKey: ["team"], queryFn: () => api.team.list() });
  const members = q.data ?? [];

  const invite = (
    <Guarded perm={"team.invite" satisfies Permission}>
      <Button onClick={() => setOpen(true)}>
        <UserPlus className="size-4" />
        Invite member
      </Button>
    </Guarded>
  );

  return (
    <SettingsPage
      title="Members"
      description="People who can sign in to this workspace, and the role they hold."
      actions={invite}
    >
      {q.isPending ? (
        <ListSkeleton rows={4} />
      ) : q.isError ? (
        <ErrorState onRetry={() => q.refetch()} />
      ) : members.length === 0 ? (
        <Card>
          <EmptyState
            icon={UserPlus}
            title="No members yet"
            description="Invite your first teammate to share the inbox."
            action={invite}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="flex items-center gap-2 font-medium">
                    <PresenceAvatar name={m.name} tone={m.avatarColor} online={m.online} />
                    {m.name}
                  </TableCell>
                  <TableCell>{m.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{ROLE_LABEL[m.role]}</Badge>
                  </TableCell>
                  <TableCell>{m.online ? "Online" : "Offline"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a teammate</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success(`Invite queued for ${email}`);
              setEmail("");
              setOpen(false);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="invite-email">Work email</Label>
              <Input
                id="invite-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["admin", "manager", "agent", "readonly"] as const).map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">Send invite</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SettingsPage>
  );
}
