"use client";

import { AlertTriangle, Info, MapPin } from "lucide-react";
import { useDemoStore } from "@/features/demo/demo-store";
import type { OperationalAlert } from "@/types/domain";
import { useToast } from "@/components/providers/toast-provider";
import { cn } from "@/lib/utils";

const toneStyles = {
  warning: {
    wrap: "border-l-amber-500 bg-amber-50/70",
    title: "text-[#451a03]",
    body: "text-[#78350f]",
    time: "text-[#92400e]",
    icon: AlertTriangle,
    iconColor: "text-amber-600",
  },
  danger: {
    wrap: "border-l-rose-500 bg-rose-50/60",
    title: "text-[#4c0519]",
    body: "text-[#881337]",
    time: "text-[#9f1239]",
    icon: MapPin,
    iconColor: "text-rose-600",
  },
  info: {
    wrap: "border-l-primary bg-muted",
    title: "text-text-primary",
    body: "text-text-secondary",
    time: "text-success-dark",
    icon: Info,
    iconColor: "text-primary",
  },
} as const;

export function DashboardAlerts() {
  const { alerts } = useDemoStore();

  return (
    <article className="rounded bg-surface p-6 lg:col-span-2">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold text-text-primary">
            Operational Alerts
          </h3>
          <p className="text-xs text-text-secondary">
            Critical paths, scanners and geofence signals
          </p>
        </div>
      </header>

      <ul className="mt-5 space-y-3.5">
        {alerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </ul>
    </article>
  );
}

function AlertCard({ alert }: { alert: OperationalAlert }) {
  const style = toneStyles[alert.tone];
  const Icon = style.icon;
  const { push } = useToast();

  return (
    <li className={cn("rounded border-l-4 p-3.5", style.wrap)}>
      <div className="flex gap-2.5">
        <Icon className={cn("mt-0.5 size-4 shrink-0", style.iconColor)} />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className={cn("text-xs font-bold", style.title)}>{alert.title}</p>
            <span className={cn("text-[10px] font-medium", style.time)}>
              {alert.time}
            </span>
          </div>
          <p className={cn("text-[11px] leading-relaxed", style.body)}>
            {alert.body}
          </p>
          <div className="flex justify-end gap-2 pt-1">
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
