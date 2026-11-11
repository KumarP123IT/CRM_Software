import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, KeyRound, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, type ApiKey, type CreateApiKeyInput } from "@/api";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ListSkeleton, Guarded } from "@/components/shared";
import { SettingsPage } from "./SettingsPage";

export function Security() {
  return (
    <SettingsPage
      title="Security"
      description="Password, two-factor authentication, and API keys for your account."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <PasswordCard />
        <TwoFactorCard />
      </div>
      <ApiKeysCard />
    </SettingsPage>
  );
}

function PasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const change = useMutation({
    mutationFn: () => api.security.changePassword({ currentPassword: current, newPassword: next }),
    onSuccess: () => {
      toast.success("Password updated — other sessions were signed out");
      setCurrent("");
      setNext("");
      setConfirm("");
    },
    onError: () => toast.error("Couldn't update password — check your current password"),
  });

  const valid = current && next.length >= 8 && next === confirm;

  return (
    <Card className="p-6">
      <h2 className="mb-4 font-semibold">Password</h2>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (next !== confirm) {
            toast.error("Passwords don't match");
            return;
          }
          change.mutate();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="current-pw">Current password</Label>
          <Input
            id="current-pw"
            type="password"
            autoComplete="current-password"
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
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            minLength={8}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-pw">Confirm new password</Label>
          <Input
            id="confirm-pw"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            minLength={8}
            required
          />
        </div>
        <Button type="submit" loading={change.isPending} disabled={!valid}>
          Update password
        </Button>
      </form>
    </Card>
  );
}

function TwoFactorCard() {
  const qc = useQueryClient();
  const status = useQuery({ queryKey: ["totp-status"], queryFn: () => api.security.totpStatus() });
  const [step, setStep] = useState<"idle" | "setup" | "disable">("idle");
  const [secret, setSecret] = useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [code, setCode] = useState("");

  const invalidate = () => void qc.invalidateQueries({ queryKey: ["totp-status"] });

  const setup = useMutation({
    mutationFn: () => api.security.totpSetup(),
    onSuccess: (r) => {
      setSecret(r);
      setStep("setup");
    },
    onError: () => toast.error("Couldn't start setup"),
  });

  const enable = useMutation({
    mutationFn: () => api.security.totpEnable(code),
    onSuccess: () => {
      toast.success("Two-factor authentication enabled");
      setStep("idle");
      setSecret(null);
      setCode("");
      invalidate();
    },
    onError: () => toast.error("Invalid code — try again"),
  });

  const disable = useMutation({
    mutationFn: () => api.security.totpDisable(code),
    onSuccess: () => {
      toast.success("Two-factor authentication disabled");
      setStep("idle");
      setCode("");
      invalidate();
    },
    onError: () => toast.error("Invalid code — try again"),
  });

  const enabled = status.data?.enabled ?? false;

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="size-4" />
          Two-factor authentication
        </h2>
        <Badge variant={enabled ? "default" : "secondary"} className="text-[10px]">
          {enabled ? "on" : "off"}
        </Badge>
      </div>

      {step === "idle" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {enabled
              ? "Your account asks for a 6-digit code at sign-in."
              : "Add an authenticator-app code as a second sign-in factor."}
          </p>
          {enabled ? (
            <Button variant="outline" onClick={() => setStep("disable")}>
              Disable 2FA
            </Button>
          ) : (
            <Button onClick={() => setup.mutate()} loading={setup.isPending}>
              Enable 2FA
            </Button>
          )}
        </div>
      )}

      {step === "setup" && secret && (
        <div className="space-y-4">
          <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Add this key to your authenticator app (or open the otpauth link).</li>
            <li>Enter the 6-digit code it shows.</li>
          </ol>
          <div className="rounded-md border bg-muted/50 p-3">
            <p className="font-mono text-sm tracking-wider">{secret.secret}</p>
            <a
              href={secret.otpauthUrl}
              className="mt-1 block truncate text-xs text-primary hover:underline"
            >
              {secret.otpauthUrl}
            </a>
          </div>
          <div className="space-y-2">
            <Label htmlFor="totp-code">Authentication code</Label>
            <Input
              id="totp-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
            />
          </div>
          <div className="flex gap-2">
            <Button
              disabled={code.length !== 6 || enable.isPending}
              loading={enable.isPending}
              onClick={() => enable.mutate()}
            >
              Verify &amp; enable
            </Button>
            <Button variant="outline" onClick={() => setStep("idle")}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {step === "disable" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter a current code from your authenticator app to disable 2FA.
          </p>
          <div className="space-y-2">
            <Label htmlFor="totp-disable-code">Authentication code</Label>
            <Input
              id="totp-disable-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              disabled={code.length !== 6 || disable.isPending}
              loading={disable.isPending}
              onClick={() => disable.mutate()}
            >
              Disable
            </Button>
            <Button variant="outline" onClick={() => setStep("idle")}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function ApiKeysCard() {
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [revealed, setRevealed] = useState<{ id: string; key: string; name: string } | null>(null);

  const q = useQuery({ queryKey: ["api-keys"], queryFn: () => api.apiKeys.list() });

  const revoke = useMutation({
    mutationFn: (id: string) => api.apiKeys.revoke(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["api-keys"] }),
    onError: () => toast.error("Couldn't revoke key"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.apiKeys.remove(id),
    onSuccess: () => {
      toast.success("API key deleted");
      void qc.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: () => toast.error("Couldn't delete key"),
  });

  const keys = q.data ?? [];

  return (
    <Card className="mt-4 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-semibold">
            <KeyRound className="size-4" />
            API keys
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Authenticate programmatic access with the <code>X-Api-Key</code> header. Keys are stored
            hashed — the raw value is shown once.
          </p>
        </div>
        <Guarded perm="settings.manage">
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="mr-1.5 size-4" />
            New key
          </Button>
        </Guarded>
      </div>

      {q.isPending ? (
        <ListSkeleton rows={2} />
      ) : keys.length === 0 ? (
        <p className="text-sm text-muted-foreground">No API keys yet.</p>
      ) : (
        <ul className="divide-y">
          {keys.map((k) => (
            <ApiKeyRow
              key={k.id}
              apiKey={k}
              onRevoke={() => revoke.mutate(k.id)}
              onDelete={() => remove.mutate(k.id)}
            />
          ))}
        </ul>
      )}

      {creating && (
        <ApiKeyDialog
          onClose={() => setCreating(false)}
          onCreated={(r) => setRevealed({ id: r.id, key: r.key, name: r.name })}
        />
      )}
      {revealed && (
        <Dialog open onOpenChange={(o) => !o && setRevealed(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>API key created</DialogTitle>
              <DialogDescription>
                Copy <strong>{revealed.name}</strong> now — it won't be shown again.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-3">
              <code className="flex-1 break-all font-mono text-xs">{revealed.key}</code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  void navigator.clipboard.writeText(revealed.key).then(
                    () => toast.success("Key copied"),
                    () => toast.error("Couldn't copy"),
                  );
                }}
              >
                <Copy className="size-4" />
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={() => setRevealed(null)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}

function ApiKeyRow({
  apiKey,
  onRevoke,
  onDelete,
}: {
  apiKey: ApiKey;
  onRevoke: () => void;
  onDelete: () => void;
}) {
  const dead = !!apiKey.revokedAt;
  return (
    <li className={cn("flex items-center gap-3 py-3", dead && "opacity-60")}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{apiKey.name}</span>
          <Badge variant="secondary" className="font-mono text-[10px]">
            {apiKey.prefix}…
          </Badge>
          {apiKey.scopes.map((s) => (
            <Badge key={s} variant="outline" className="text-[10px]">
              {s}
            </Badge>
          ))}
          {dead && (
            <Badge variant="destructive" className="text-[10px]">
              revoked
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {apiKey.lastUsedAt
            ? `Last used ${new Date(apiKey.lastUsedAt).toLocaleDateString()}`
            : "Never used"}
        </p>
      </div>
      <Guarded perm="settings.manage">
        <>
          {!dead && (
            <button
              onClick={onRevoke}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Revoke
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1 text-muted-foreground hover:text-destructive"
            aria-label={`Delete ${apiKey.name}`}
          >
            <Trash2 className="size-4" />
          </button>
        </>
      </Guarded>
    </li>
  );
}

function ApiKeyDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (k: { id: string; key: string; name: string }) => void;
}) {
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<("read" | "write")[]>(["read"]);

  const create = useMutation({
    mutationFn: () => {
      const input: CreateApiKeyInput = { name: name.trim(), scopes };
      return api.apiKeys.create(input);
    },
    onSuccess: (r) => {
      toast.success("API key created");
      onCreated({ id: r.id, key: r.key, name: r.name });
      onClose();
    },
    onError: () => toast.error("Couldn't create API key"),
  });

  const toggleScope = (s: "read" | "write", checked: boolean) =>
    setScopes((prev) => {
      const next = checked ? [...prev, s] : prev.filter((x) => x !== s);
      return next.length ? next : prev;
    });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New API key</DialogTitle>
          <DialogDescription>
            <code>read</code> allows GET requests; <code>write</code> adds mutations (maps to agent
            permissions).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="ak-name">Name</Label>
            <Input
              id="ak-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Zapier sync"
            />
          </div>
          <div className="space-y-2">
            <Label>Scopes</Label>
            {(["read", "write"] as const).map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={scopes.includes(s)}
                  onCheckedChange={(c) => toggleScope(s, c === true)}
                />
                <code>{s}</code>
              </label>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!name.trim() || create.isPending}
            loading={create.isPending}
            onClick={() => create.mutate()}
          >
            Create key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
