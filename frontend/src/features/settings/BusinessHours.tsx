import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SettingsPage } from "./SettingsPage";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export function BusinessHours() {
  const [days, setDays] = useState(
    DAYS.map((day) => ({
      day,
      open: day !== "Sunday",
      start: "09:00",
      end: "21:00",
    })),
  );

  return (
    <SettingsPage
      title="Business Hours"
      description="Hours are stored in IST (Asia/Kolkata). Outside these hours, auto-replies can take over."
    >
      <Card className="p-6">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Business hours saved");
          }}
        >
          <ul className="divide-y">
            {days.map((row, i) => (
              <li key={row.day} className="flex flex-wrap items-center gap-3 py-3">
                <Switch
                  checked={row.open}
                  onCheckedChange={(open) =>
                    setDays((prev) => prev.map((d, idx) => (idx === i ? { ...d, open } : d)))
                  }
                  aria-label={`${row.day} open`}
                />
                <span className="w-28 font-medium">{row.day}</span>
                <div className="flex items-center gap-2">
                  <Label className="sr-only" htmlFor={`${row.day}-start`}>
                    Opens
                  </Label>
                  <Input
                    id={`${row.day}-start`}
                    type="time"
                    value={row.start}
                    disabled={!row.open}
                    onChange={(e) =>
                      setDays((prev) =>
                        prev.map((d, idx) => (idx === i ? { ...d, start: e.target.value } : d)),
                      )
                    }
                    className="w-32"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    id={`${row.day}-end`}
                    type="time"
                    value={row.end}
                    disabled={!row.open}
                    onChange={(e) =>
                      setDays((prev) =>
                        prev.map((d, idx) => (idx === i ? { ...d, end: e.target.value } : d)),
                      )
                    }
                    className="w-32"
                  />
                </div>
              </li>
            ))}
          </ul>
          <Button type="submit">Save hours</Button>
        </form>
      </Card>
    </SettingsPage>
  );
}
