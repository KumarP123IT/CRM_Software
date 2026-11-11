import * as React from "react";
import { AlertCircle, type LucideIcon } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";
import { usePermission, type Permission } from "@/lib/permissions";

/* ---------- PageHeader ---------- */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-base text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/* ---------- EmptyState ---------- */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center px-6 py-14 text-center", className)}
    >
      <div className="relative mb-5">
        <div
          className="absolute inset-0 -m-3 rounded-full bg-primary-soft opacity-60 blur-xl"
          aria-hidden
        />
        <div className="relative flex size-14 items-center justify-center rounded-2xl border bg-card text-primary shadow-card">
          <Icon className="size-6" aria-hidden />
        </div>
      </div>
      <h3 className="text-md font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 max-w-sm text-base text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------- ErrorState ---------- */
export function ErrorState({
  message = "We couldn't load this.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-destructive-soft text-destructive">
        <AlertCircle className="size-5" aria-hidden />
      </div>
      <p className="text-base text-foreground">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/* ---------- ListSkeleton ---------- */
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Avatar with presence ---------- */
const AVATAR_TONES = [
  "bg-primary-soft text-primary",
  "bg-success-soft text-success",
  "bg-warning-soft text-warning",
  "bg-info-soft text-info",
  "bg-destructive-soft text-destructive",
];
export function PresenceAvatar({
  name,
  tone,
  online,
  size = "md",
}: {
  name: string;
  tone?: number;
  online?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const t = tone ?? name.length;
  const sz =
    size === "sm" ? "size-7 text-xs" : size === "lg" ? "size-11 text-base" : "size-9 text-sm";
  return (
    <span className="relative inline-flex shrink-0">
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold",
          sz,
          AVATAR_TONES[t % AVATAR_TONES.length],
        )}
        aria-hidden
      >
        {initials(name)}
      </span>
      {online !== undefined && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-card",
            online ? "bg-success" : "bg-muted-foreground/50",
          )}
          aria-label={online ? "Online" : "Offline"}
          role="img"
        />
      )}
    </span>
  );
}

/* ---------- Kbd ---------- */
export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded border bg-muted px-1.5 font-sans text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

/* ---------- StatCard ---------- */
export function StatCard({
  label,
  value,
  delta,
  trend,
  icon: Icon,
  goodWhenDown = false,
  loading,
}: {
  label: string;
  value: string;
  delta?: number | undefined;
  trend?: number[] | undefined;
  icon: LucideIcon;
  goodWhenDown?: boolean;
  loading?: boolean | undefined;
}) {
  const id = React.useId().replace(/:/g, "");
  if (loading) {
    return (
      <Card className="p-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-4 h-8 w-20" />
        <Skeleton className="mt-4 h-10 w-full" />
      </Card>
    );
  }
  const positive = delta !== undefined && (goodWhenDown ? delta < 0 : delta > 0);
  return (
    <Card className="group p-5 transition-shadow duration-200 hover:shadow-float">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="flex size-8 items-center justify-center rounded-md bg-primary-soft text-primary">
          <Icon className="size-4" aria-hidden />
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-2xl font-bold tabular text-foreground">{value}</span>
        {delta !== undefined && (
          <span
            className={cn(
              "text-sm font-medium tabular",
              positive ? "text-success" : "text-destructive",
            )}
          >
            {delta > 0 ? "+" : ""}
            {delta}%
          </span>
        )}
      </div>
      {trend && (
        <div className="mt-3 h-10" aria-hidden>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trend.map((v, i) => ({ i, v }))}
              margin={{ top: 2, bottom: 0, left: 0, right: 0 }}
            >
              <defs>
                <linearGradient id={`g${id}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill={`url(#g${id})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

/* ---------- Permission-aware wrapper ---------- */
export function Guarded({
  perm,
  children,
  mode = "disable",
}: {
  perm: Permission;
  children: React.ReactElement<{ disabled?: boolean }>;
  mode?: "disable" | "hide";
}) {
  const { allowed, reason } = usePermission(perm);
  if (allowed) return children;
  if (mode === "hide") return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} className="inline-flex">
          {React.cloneElement(children, { disabled: true })}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-60">{reason}</TooltipContent>
    </Tooltip>
  );
}

/* ---------- FilterBar ---------- */
export function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-2 shadow-soft">
      {children}
    </div>
  );
}

/* ---------- ProgressRing ---------- */
export function ProgressRing({ value, size = 56 }: { value: number; size?: number }) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg
      width={size}
      height={size}
      className="-rotate-90"
      role="img"
      aria-label={`${Math.round(value)}% complete`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--color-muted)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value / 100)}
        className="transition-[stroke-dashoffset] duration-500"
      />
    </svg>
  );
}
