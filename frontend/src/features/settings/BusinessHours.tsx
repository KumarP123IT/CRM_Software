import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, type BusinessHoursConfig, type DayHours } from "@/api";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListSkeleton, ErrorState, Guarded } from "@/components/shared";
import { SettingsPage } from "./SettingsPage";

// UI order is Monday-first; stored `day` is 0=Sunday…6=Saturday.
const DAYS: { label: string; day: number }[] = [
  { label: "Monday", day: 1 },
  { label: "Tuesday", day: 2 },
  { label: "Wednesday", day: 3 },
  { label: "Thursday", day: 4 },
  { label: "Friday", day: 5 },
  { label: "Saturday", day: 6 },
  { label: "Sunday", day: 0 },
];

const TIMEZONES = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "Australia/Sydney",
  "UTC",
];

interface DayRow {
  open: boolean;
  start: string;
  end: string;
}

export function BusinessHours() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["business-hours"],
    queryFn: () => api.automation.businessHours(),
  });
  const [enabled, setEnabled] = useState(true);
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [rows, setRows] = useState<Record<number, DayRow>>({});

  useEffect(() => {
    if (!q.data) return;
    setEnabled(q.data.enabled);
    setTimezone(q.data.timezone);
    const map: Record<number, DayRow> = {};
    for (const d of DAYS) map[d.day] = { open: false, start: "09:00", end: "21:00" };
    for (const h of q.data.hours) {
      map[h.day] = { open: true, start: h.open, end: h.close };
    }
    setRows(map);
  }, [q.data]);

  const save = useMutation({
    mutationFn: (input: BusinessHoursConfig) => api.automation.updateBusinessHours(input),
    onSuccess: () => {
      toast.success("Business hours saved");
      void qc.invalidateQueries({ queryKey: ["business-hours"] });
    },
    onError: () => toast.error("Couldn't save business hours"),
  });

  const tzOptions = TIMEZONES.includes(timezone) ? TIMEZONES : [timezone, ...TIMEZONES];

  return (
    <SettingsPage
      title="Business Hours"
      description="Outside these hours, after-hours auto-replies can take over."
    >
      {q.isPending ? (
        <Card className="p-6">
          <ListSkeleton rows={6} />
        </Card>
      ) : q.isError ? (
        <Card className="p-6">
          <ErrorState onRetry={() => void q.refetch()} />
        </Card>
      ) : (
        <Card className="p-6">
          <form
            className="max-w-xl space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              const hours: DayHours[] = DAYS.filter((d) => rows[d.day]?.open).map((d) => ({
                day: d.day,
                open: rows[d.day]!.start,
                close: rows[d.day]!.end,
              }));
              save.mutate({ enabled, timezone, hours });
            }}
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <Switch id="bh-enabled" checked={enabled} onCheckedChange={setEnabled} />
                <Label htmlFor="bh-enabled">Enforce business hours</Label>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="bh-tz">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="bh-tz" className="w-52">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tzOptions.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ul className="divide-y">
              {DAYS.map(({ label, day }) => {
                const row = rows[day] ?? { open: false, start: "09:00", end: "21:00" };
                return (
                  <li key={label} className="flex flex-wrap items-center gap-3 py-3">
                    <Switch
                      checked={row.open}
                      onCheckedChange={(open) =>
                        setRows((prev) => ({ ...prev, [day]: { ...row, open } }))
                      }
                      aria-label={`${label} open`}
                    />
                    <span className="w-28 font-medium">{label}</span>
                    <div className="flex items-center gap-2">
                      <Label className="sr-only" htmlFor={`${label}-start`}>
                        Opens
                      </Label>
                      <Input
                        id={`${label}-start`}
                        type="time"
                        value={row.start}
                        disabled={!row.open}
                        onChange={(e) =>
                          setRows((prev) => ({
                            ...prev,
                            [day]: { ...row, start: e.target.value },
                          }))
                        }
                        className="w-32"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        id={`${label}-end`}
                        type="time"
                        value={row.end}
                        disabled={!row.open}
                        onChange={(e) =>
                          setRows((prev) => ({ ...prev, [day]: { ...row, end: e.target.value } }))
                        }
                        className="w-32"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>

            <Guarded perm="settings.manage">
              <Button type="submit" loading={save.isPending}>
                Save hours
              </Button>
            </Guarded>
          </form>
        </Card>
      )}
    </SettingsPage>
  );
}
