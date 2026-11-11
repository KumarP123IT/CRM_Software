import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/lib/theme";
import type { ThemePref } from "@/stores/ui";
import { cn } from "@/lib/utils";
import { SettingsPage } from "./SettingsPage";

const OPTIONS: { id: ThemePref; label: string; hint: string }[] = [
  { id: "light", label: "Light", hint: "Always light" },
  { id: "dark", label: "Dark", hint: "Always dark" },
  { id: "system", label: "System", hint: "Follow the device" },
];

export function Appearance() {
  const { theme, setTheme } = useTheme();

  return (
    <SettingsPage
      title="Appearance"
      description="Colour scheme for this browser. Preference is stored locally."
    >
      <Card className="grid gap-3 p-6 sm:grid-cols-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setTheme(opt.id)}
            className={cn(
              "rounded-md border p-4 text-left transition-colors",
              theme === opt.id ? "border-primary bg-primary-soft" : "hover:bg-muted",
            )}
          >
            <Label className="pointer-events-none">{opt.label}</Label>
            <p className="text-sm text-muted-foreground">{opt.hint}</p>
          </button>
        ))}
      </Card>
    </SettingsPage>
  );
}
