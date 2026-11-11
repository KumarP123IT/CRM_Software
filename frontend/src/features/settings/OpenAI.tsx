import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Guarded } from "@/components/shared";
import { SettingsPage } from "./SettingsPage";

export function OpenAI() {
  const [key, setKey] = useState("");
  const [masked, setMasked] = useState<string | null>(null);
  const save = useMutation({
    mutationFn: (k: string) => api.integrations.saveOpenAiKey(k),
    onSuccess: (r) => {
      setMasked(r.masked);
      setKey("");
      toast.success("API key saved");
    },
    onError: () => toast.error("Couldn't save the key. Try again."),
  });

  return (
    <SettingsPage
      title="OpenAI"
      description="Bring your own key. It is sent to the backend and only a masked form is shown again."
    >
      <Card className="max-w-lg space-y-4 p-6">
        {masked && (
          <p className="text-sm text-muted-foreground">
            Stored key: <span className="font-mono">{masked}</span>
          </p>
        )}
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate(key);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="openai-key">Secret key</Label>
            <Input
              id="openai-key"
              type="password"
              autoComplete="off"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-…"
              required
            />
          </div>
          <Guarded perm="ai.configure">
            <Button type="submit" loading={save.isPending} disabled={!key}>
              Save key
            </Button>
          </Guarded>
        </form>
      </Card>
    </SettingsPage>
  );
}
