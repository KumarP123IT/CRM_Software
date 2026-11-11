import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Guarded, ListSkeleton } from "@/components/shared";
import { SettingsPage } from "./SettingsPage";

export function OpenAI() {
  const qc = useQueryClient();
  const [key, setKey] = useState("");
  const status = useQuery({
    queryKey: ["openai-status"],
    queryFn: () => api.integrations.openaiStatus(),
  });

  const save = useMutation({
    mutationFn: (k: string) => api.integrations.saveOpenAiKey(k),
    onSuccess: () => {
      setKey("");
      toast.success("API key saved");
      void qc.invalidateQueries({ queryKey: ["openai-status"] });
    },
    onError: () => toast.error("Couldn't save the key. Try again."),
  });

  const test = useMutation({
    mutationFn: () => api.integrations.testOpenAi(),
    onSuccess: (r) => {
      if (r.ok) toast.success("Connection OK — OpenAI responded");
      else toast.error(`Connection failed: ${r.error ?? "unknown error"}`);
    },
    onError: () => toast.error("Couldn't test the key"),
  });

  const remove = useMutation({
    mutationFn: () => api.integrations.removeOpenAiKey(),
    onSuccess: () => {
      toast.success("API key removed");
      void qc.invalidateQueries({ queryKey: ["openai-status"] });
    },
  });

  return (
    <SettingsPage
      title="OpenAI"
      description="Bring your own key. It is stored encrypted on the backend and powers AI reply suggestions."
    >
      <Card className="max-w-lg space-y-4 p-6">
        {status.isPending ? (
          <ListSkeleton rows={2} />
        ) : status.data?.configured ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Stored key:</span>
            <span className="font-mono">{status.data.masked}</span>
            <Badge variant="secondary" className="text-[10px]">
              configured
            </Badge>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No key configured yet.</p>
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
            <div className="flex flex-wrap gap-2">
              <Button type="submit" loading={save.isPending} disabled={!key}>
                {status.data?.configured ? "Replace key" : "Save key"}
              </Button>
              {status.data?.configured && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    loading={test.isPending}
                    onClick={() => test.mutate()}
                  >
                    Test connection
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-destructive"
                    loading={remove.isPending}
                    onClick={() => remove.mutate()}
                  >
                    Remove
                  </Button>
                </>
              )}
            </div>
          </Guarded>
        </form>
      </Card>
    </SettingsPage>
  );
}
