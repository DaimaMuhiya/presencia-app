"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Info, MapPin } from "lucide-react";
import { useDemoStore } from "@/features/demo/demo-store";
import type { OperationalAlert } from "@/types/domain";
import { useToast } from "@/components/providers/toast-provider";
import { cn } from "@/lib/utils";

type AlertFilter = "all" | OperationalAlert["tone"];

const toneStyles = {
  warning: {
    wrap: "border-l-amber-500 bg-amber-50/70",
    title: "text-[#451a03]",
    body: "text-[#78350f]",
    time: "text-[#92400e]",
    icon: AlertTriangle,
    iconColor: "text-amber-600",
    label: "Warning",
  },
  danger: {
    wrap: "border-l-rose-500 bg-rose-50/60",
    title: "text-[#4c0519]",
    body: "text-[#881337]",
    time: "text-[#9f1239]",
    icon: MapPin,
    iconColor: "text-rose-600",
    label: "Critical",
  },
  info: {
    wrap: "border-l-primary bg-muted",
    title: "text-text-primary",
    body: "text-text-secondary",
    time: "text-success-dark",
    icon: Info,
    iconColor: "text-primary",
    label: "Informational",
  },
} as const;

const FILTERS: { id: AlertFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "danger", label: "Critical" },
  { id: "warning", label: "Warning" },
  { id: "info", label: "Informational" },
];

export function DashboardAlerts() {
  const { alerts } = useDemoStore();
  const [filter, setFilter] = useState<AlertFilter>("all");

  const visible = useMemo(
    () => (filter === "all" ? alerts : alerts.filter((a) => a.tone === filter)),
    [alerts, filter]
  );

  return (
    <article className="w-full rounded bg-surface p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-display text-base font-bold text-text-primary">
            Operational Alerts
          </h3>
          <p className="text-xs text-text-secondary">
            Critical paths, scanners and geofence signals
          </p>
        </div>
        <div
          className="flex flex-wrap gap-1.5"
          role="tablist"
          aria-label="Filtrer les alertes"
        >
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={filter === item.id}
              onClick={() => setFilter(item.id)}
              className={cn(
                "rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                filter === item.id
                  ? item.id === "warning"
                    ? "bg-warning-muted text-[#78350f]"
                    : item.id === "danger"
                      ? "bg-danger-muted text-rose-800"
                      : item.id === "info"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-text-primary"
                  : "bg-muted/80 text-text-secondary"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <ul className="mt-5 grid list-none gap-3.5 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </ul>

      {visible.length === 0 ? (
        <p className="mt-4 text-center text-xs text-text-secondary">
          No alerts in this category.
        </p>
      ) : null}
    </article>
  );
}

function AlertCard({ alert }: { alert: OperationalAlert }) {
  const style = toneStyles[alert.tone];
  const Icon = style.icon;
  const { push } = useToast();

  return (
    <li className={cn("flex h-full flex-col rounded border-l-4 p-3.5", style.wrap)}>
      <div className="flex min-h-0 flex-1 gap-2.5">
        <Icon className={cn("mt-0.5 size-4 shrink-0", style.iconColor)} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <AlertSeverityBadge label={style.label} tone={alert.tone} />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className={cn("text-xs font-bold", style.title)}>{alert.title}</p>
            <span className={cn("text-[10px] font-medium", style.time)}>
              {alert.time}
            </span>
          </div>
          <p className={cn("flex-1 text-[11px] leading-relaxed", style.body)}>
            {alert.body}
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() =>
                push({
                  tone: "success",
                  title: "Action simulée",
                  description: `${alert.title} — aucun backend connecté.`,
                })
              }
              className="rounded bg-surface px-2.5 py-1 text-[11px] font-bold text-primary"
            >
              Acknowledge
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

function AlertSeverityBadge({
  label,
  tone,
}: {
  label: string;
  tone: OperationalAlert["tone"];
}) {
  return (
    <span
      className={cn(
        "mb-0.5 w-fit rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
        tone === "warning" && "bg-amber-200/60 text-[#78350f]",
        tone === "danger" && "bg-rose-200/70 text-rose-900",
        tone === "info" && "bg-primary/10 text-primary"
      )}
    >
      {label}
    </span>
  );
}
