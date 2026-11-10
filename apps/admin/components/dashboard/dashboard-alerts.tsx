import { AlertTriangle, Info, MapPin } from "lucide-react";
import { DEMO_ALERTS } from "@/features/dashboard/demo-data";
import type { OperationalAlert } from "@/types/dashboard";
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
        <div className="flex gap-1.5">
          <span className="rounded bg-warning-muted px-2 py-1 text-[10px] font-bold uppercase text-[#78350f]">
            Warning
          </span>
          <span className="rounded bg-muted px-2 py-1 text-[10px] font-bold uppercase text-text-secondary">
            All
          </span>
        </div>
      </header>

      <ul className="mt-5 space-y-3.5">
        {DEMO_ALERTS.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </ul>
    </article>
  );
}

function AlertCard({ alert }: { alert: OperationalAlert }) {
  const style = toneStyles[alert.tone];
  const Icon = style.icon;

  return (
    <li
      className={cn(
        "rounded border-l-4 p-3.5",
        style.wrap
      )}
    >
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
          {alert.actions?.length ? (
            <div className="flex justify-end gap-2 pt-1">
              {alert.actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  disabled
                  className={cn(
                    "rounded px-2.5 py-1 text-[11px] font-bold",
                    action.primary
                      ? alert.tone === "warning"
                        ? "bg-amber-200/80 text-[#451a03]"
                        : "bg-rose-200/80 text-[#4c0519]"
                      : "bg-surface text-text-primary"
                  )}
                >
                  {action.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}
