import { ChevronDown } from "lucide-react";
import { DEMO_DEPARTMENTS } from "@/features/dashboard/demo-data";
import type { DepartmentRow } from "@/types/dashboard";
import { cn } from "@/lib/utils";

const rankBg = {
  green: "bg-[#d1fae5] text-success-fg",
  blue: "bg-[#d5e3fd] text-primary",
  amber: "bg-warning-muted text-[#92400e]",
} as const;

export function DashboardDepartments() {
  return (
    <article className="flex h-full flex-col rounded bg-surface p-6 lg:col-span-3">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold text-text-primary">
            Department Attendance Rates
          </h3>
          <p className="text-xs text-text-secondary">
            Ranked by daily attendance vs 90% operational target
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-text-secondary">Sort</span>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1 rounded bg-muted px-2.5 py-1.5 text-xs font-bold text-primary"
          >
            Rate
            <ChevronDown className="size-2.5" />
          </button>
        </div>
      </header>

      <ul className="mt-6 space-y-4">
        {DEMO_DEPARTMENTS.map((dept) => (
          <DepartmentBar key={dept.name} dept={dept} />
        ))}
      </ul>
    </article>
  );
}

function DepartmentBar({ dept }: { dept: DepartmentRow }) {
  return (
    <li className="rounded bg-muted/70 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded text-xs font-bold",
              rankBg[dept.rankTone]
            )}
          >
            {dept.rank}
          </span>
          <div>
            <p className="text-xs font-bold text-text-primary">{dept.name}</p>
            <p className="text-[11px] text-text-secondary">{dept.meta}</p>
          </div>
        </div>
        <div className="text-right">
          <p
            className={cn(
              "text-sm font-bold",
              dept.rankTone === "amber"
                ? "text-[#b45309]"
                : dept.rankTone === "blue"
                  ? "text-primary"
                  : "text-success-dark"
            )}
          >
            {dept.rate}%
          </p>
          {dept.badge ? (
            <span
              className={cn(
                "inline-block rounded px-1.5 text-[10px] font-bold",
                dept.badgeTone === "amber"
                  ? "text-[#b45309]"
                  : dept.badgeTone === "neutral"
                    ? "bg-muted text-text-secondary"
                    : "bg-[#d1fae5]/60 text-success-fg"
              )}
            >
              {dept.badge}
            </span>
          ) : null}
        </div>
      </div>
      <div className="relative mt-2 h-2 rounded bg-[#e6e8ea]">
        <div
          className="absolute inset-y-0 left-0 rounded"
          style={{
            width: `${dept.rate}%`,
            background: dept.barColor,
          }}
        />
        <div
          className="absolute top-0 bottom-0 w-px bg-text-secondary"
          style={{ left: "90%" }}
          aria-hidden
        />
      </div>
    </li>
  );
}
