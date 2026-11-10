"use client";

import { AttendanceTrendChart } from "@/components/charts/attendance-trend-chart";
import { TREND_SERIES } from "@/features/dashboard/selectors";
import { useDemoStore } from "@/features/demo/demo-store";

const CALLOUTS = [
  { label: "Peak attendance", value: "Monday (91.2%)", hint: "Highest weekly density" },
  {
    label: "Weekly average",
    value: "88.1% (Workdays)",
    hint: "+1.2% vs prior week",
    hintTone: "green" as const,
  },
  { label: "Late trend", value: "-1.8% Improving", hint: "Scanner sync optimized" },
];

export function DashboardTrendPanel() {
  const { workforce, dashboardFilters, setDashboardFilters } = useDemoStore();

  const trendData = TREND_SERIES.map((point) =>
    point.label === "Today"
      ? {
          ...point,
          present: workforce.physicalAttendance,
          absent: workforce.absentToday,
          late: workforce.lateArrivals,
        }
      : { ...point }
  );

  return (
    <article className="rounded bg-surface p-6 lg:col-span-2">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="font-display text-base font-bold text-text-primary">
            Attendance Evolution & Velocity
          </h3>
          <p className="mt-0.5 text-xs text-text-secondary">
            Real-time and historical presence across campuses
          </p>
        </div>
        <div className="flex flex-wrap gap-1 rounded bg-muted p-1">
          {(
            [
              ["today", "7"],
              ["7d", "15"],
              ["30d", "30"],
            ] as const
          ).map(([period, label]) => (
            <button
              key={period}
              type="button"
              onClick={() => setDashboardFilters({ period })}
              className={
                dashboardFilters.period === period
                  ? "rounded bg-surface px-2.5 py-1 text-[11px] font-semibold text-primary"
                  : "rounded px-2.5 py-1 text-[11px] font-semibold text-text-secondary"
              }
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="relative mt-4 overflow-hidden rounded bg-muted/50 p-4">
        <AttendanceTrendChart data={trendData} />
        <div className="absolute right-4 top-4 rounded bg-primary px-2.5 py-2 text-white shadow-lg">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#b6c4ff]">
            Today snapshot
          </p>
          <p className="text-xs font-bold">
            {workforce.physicalAttendance} present · {workforce.absentToday} absent
          </p>
          <p className="mt-0.5 text-[10px] text-[#e6e8ea]">{workforce.lateArrivals} late</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {CALLOUTS.map((c) => (
          <div key={c.label} className="rounded bg-muted px-3 py-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-text-secondary">
              {c.label}
            </p>
            <p className="mt-1 text-sm font-bold text-text-primary">{c.value}</p>
            <p
              className={
                c.hintTone === "green"
                  ? "text-[11px] font-semibold text-success-dark"
                  : "text-[11px] text-text-secondary"
              }
            >
              {c.hint}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
