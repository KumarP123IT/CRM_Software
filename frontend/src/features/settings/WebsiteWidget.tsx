import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/api";
import { BASE_URL } from "@/api/http";
import { useAuth } from "@/stores/auth";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SettingsPage } from "./SettingsPage";

export function WebsiteWidget() {
  const qc = useQueryClient();
  const workspaceId = useAuth((s) => s.workspaceId);
  const [domains, setDomains] = useState("");
  const [saving, setSaving] = useState(false);

  const wsQuery = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => api.workspaces.get(workspaceId),
    enabled: !!workspaceId,
  });

  const inboxesQuery = useQuery({
    queryKey: ["inboxes"],
    queryFn: () => api.inboxes.list(),
  });
  const webAccount = inboxesQuery.data?.items.find((i) => i.type === "web");

  const detailQuery = useQuery({
    queryKey: ["inbox", webAccount?.id],
    queryFn: () => api.inboxes.get(webAccount!.id),
    enabled: !!webAccount?.id,
  });

  useEffect(() => {
    if (wsQuery.data) {
      setDomains((wsQuery.data.widgetAllowedDomains ?? []).join("\n"));
    }
  }, [wsQuery.data]);

  const apiOrigin = new URL(BASE_URL, window.location.origin).origin;
  const snippet = webAccount
    ? `<script src="${apiOrigin}/widget.js" data-account="${webAccount.id}" data-widget-token="${detailQuery.data?.widgetToken ?? "…"}" async></script>`
    : "Connect a web inbox first (Channels → Add inbox → Website widget), then copy the snippet here.";

  const saveDomains = async () => {
    setSaving(true);
    try {
      const list = domains
        .split(/[\s,]+/)
        .map((d) => d.trim().toLowerCase())
        .filter(Boolean);
      await api.workspaces.update(workspaceId, { widgetAllowedDomains: list });
      void qc.invalidateQueries({ queryKey: ["workspace", workspaceId] });
      toast.success("Allowed domains saved");
    } catch {
      toast.error("Couldn't save allowed domains");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsPage
      title="Website Chat Widget"
      description="Embed a Konvo chat launcher on your website. Visitors land in the shared inbox."
    >
      <Card className="max-w-xl space-y-5 p-6">
        <div className="space-y-2">
          <Label htmlFor="snippet">Install snippet</Label>
          <Textarea id="snippet" readOnly value={snippet} rows={3} className="font-mono text-xs" />
          {!webAccount && (
            <p className="text-xs text-muted-foreground">
              No website inbox connected yet — add one under Channels first.
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="domains">Allowed domains</Label>
          <Textarea
            id="domains"
            value={domains}
            onChange={(e) => setDomains(e.target.value)}
            rows={3}
            placeholder={"example.com\napp.example.com"}
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            One domain per line. The widget only answers requests whose Origin matches this list.
            Leave empty to allow any site.
          </p>
        </div>
        <Button type="button" onClick={() => void saveDomains()} disabled={saving}>
          Save domains
        </Button>
      </Card>
    </SettingsPage>
  );
}
