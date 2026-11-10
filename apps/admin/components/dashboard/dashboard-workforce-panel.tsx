"use client";

import { WorkforceDonutChart } from "@/components/charts/workforce-donut-chart";
import { useDemoStore } from "@/features/demo/demo-store";

const ARRIVAL_WINDOWS = [
  { label: "08:00 – 08:30", percent: "43.6%", width: 43.6, tone: "blue" as const },
  { label: "08:30 – 09:00", percent: "51.7%", width: 51.7, tone: "indigo" as const },
  { label: "After 09:00", percent: "4.7%", width: 4.7, tone: "amber" as const },
];

export function DashboardWorkforcePanel() {
  const { workforce } = useDemoStore();

  const slices = [
    { label: "On-Time", value: workforce.onTimeArrivals, color: "#00236F" },
    { label: "Late", value: workforce.lateArrivals, color: "#F59E0B" },
    { label: "Remote", value: workforce.remoteMissions, color: "#3B82F6" },
    { label: "Leave", value: workforce.plannedLeave, color: "#515F74" },
    { label: "Unexcused", value: workforce.unexcusedAbsences, color: "#F43F5E" },
  ];

  return (
    <article className="rounded bg-surface p-6">
      <header className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-base font-bold text-text-primary">
            Workforce Status
          </h3>
          <p className="text-xs text-text-secondary">Real-time status breakdown</p>
        </div>
        <span className="text-xs font-bold text-text-secondary">Today</span>
      </header>

      <WorkforceDonutChart workforce={workforce} />

      <div className="mt-2 grid grid-cols-2 gap-2">
        {slices.map((slice) => (
          <div
            key={slice.label}
            className="flex items-center justify-between rounded bg-muted px-2 py-2 text-xs"
          >
            <span className="inline-flex items-center gap-1.5 font-medium text-text-secondary">
              <span
                className="size-2.5 rounded"
                style={{ background: slice.color }}
              />
              {slice.label}
            </span>
            <span className="font-bold text-text-primary">{slice.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
          Arrival timing windows
        </p>
        <ul className="space-y-2">
          {ARRIVAL_WINDOWS.map((row) => (
            <li key={row.label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">{row.label}</span>
                <span className="font-bold text-text-primary">{row.percent}</span>
              </div>
              <div className="relative h-1.5 rounded bg-[#e6e8ea]">
                <div
                  className="absolute inset-y-0 left-0 rounded"
                  style={{
                    width: `${row.width}%`,
                    background:
                      row.tone === "blue"
                        ? "#00236F"
                        : row.tone === "indigo"
                          ? "#1E3A8A"
                          : "#F59E0B",
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
