import {
  Briefcase,
  Clock,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserX,
} from "lucide-react";
import type { DashboardKpi } from "@/types/dashboard";
import { cn } from "@/lib/utils";

const iconMap = {
  blue: Briefcase,
  green: UserCheck,
  rose: UserX,
  amber: Clock,
} as const;

const toneStyles = {
  blue: "bg-[#d5e3fd]/50 text-primary",
  green: "bg-[#d1fae5] text-success-fg",
  rose: "bg-danger-muted text-[#be123c]",
  amber: "bg-warning-muted text-[#92400e]",
} as const;

export function DashboardKpiCard({ kpi }: { kpi: DashboardKpi }) {
  const Icon = iconMap[kpi.iconTone];

  return (
    <article className="flex min-h-[218px] flex-1 flex-col justify-between gap-4 rounded bg-surface p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
            {kpi.label}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-[30px] font-extrabold leading-9 text-text-primary">
              {kpi.value}
            </p>
            {kpi.delta ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-bold",
                  kpi.deltaPositive
                    ? "bg-success-muted text-success-dark"
                    : "bg-muted text-text-secondary"
                )}
              >
                {kpi.deltaPositive ? (
                  <TrendingUp className="size-2.5" aria-hidden />
                ) : (
                  <TrendingDown className="size-2.5" aria-hidden />
                )}
                {kpi.delta}
              </span>
            ) : null}
          </div>
          {kpi.subtitle ? (
            <p className="text-xs text-text-secondary">{kpi.subtitle}</p>
          ) : null}
        </div>
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded",
            toneStyles[kpi.iconTone]
          )}
        >
          <Icon className="size-4" strokeWidth={2.25} aria-hidden />
        </div>
      </div>

      {kpi.progress != null ? (
        <div className="space-y-1.5 pt-1">
          <div className="h-1.5 overflow-hidden rounded bg-[#e6e8ea]">
            <div
              className="h-full rounded bg-linear-to-r from-success to-success-dark"
              style={{ width: `${kpi.progress}%` }}
            />
          </div>
        </div>
      ) : null}

      {kpi.footer ? (
        <div className="flex justify-between pt-3 text-[11px]">
          <span className="text-text-secondary">{kpi.footer.left}</span>
          <span
            className={cn(
              "font-semibold",
              kpi.footer.rightTone === "green" && "text-success-dark",
              kpi.footer.rightTone === "amber" && "text-[#b45309]",
              !kpi.footer.rightTone && "font-bold text-text-primary"
            )}
          >
            {kpi.footer.right}
          </span>
        </div>
      ) : null}
    </article>
  );
}
