"use client";

import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { departmentAttendanceRates } from "@/features/demo/metrics";
import { useDemoStore } from "@/features/demo/demo-store";
import { cn } from "@/lib/utils";

export function DashboardDepartments() {
  const { departments, employees, attendanceRecords, referenceDate } =
    useDemoStore();

  const rows = useMemo(() => {
    const rates = departmentAttendanceRates(
      departments,
      employees,
      attendanceRecords,
      referenceDate
    );
    return rates
      .map((r) => {
        const dept = departments.find((d) => d.id === r.departmentId)!;
        const tone =
          r.rate >= 92 ? "green" : r.rate >= 88 ? "blue" : "amber";
        const barColor =
          tone === "green" ? "#059669" : tone === "blue" ? "#00236F" : "#F59E0B";
        return {
          id: dept.id,
          name: dept.name,
          meta: `${dept.headcount} employees • ${dept.campus}`,
          rate: r.rate,
          rankTone: tone,
          barColor,
          badge:
            r.rate >= dept.targetAttendanceRate
              ? "+On target"
              : "Below target",
          badgeTone: r.rate >= dept.targetAttendanceRate ? "green" : "amber",
        };
      })
      .sort((a, b) => b.rate - a.rate)
      .map((row, index) => ({ ...row, rank: index + 1 }));
  }, [departments, employees, attendanceRecords, referenceDate]);

  return (
    <article className="flex h-full flex-col rounded bg-surface p-6 lg:col-span-3">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold text-text-primary">
            Department Attendance Rates
          </h3>
          <p className="text-xs text-text-secondary">
            Ranked by daily attendance vs operational target
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-text-secondary">Sort</span>
          <span className="inline-flex items-center gap-1 rounded bg-muted px-2.5 py-1.5 text-xs font-bold text-primary">
            Rate
            <ChevronDown className="size-2.5" />
          </span>
        </div>
      </header>

      <ul className="mt-6 space-y-4">
        {rows.map((dept) => (
          <li key={dept.id} className="rounded bg-muted/70 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded text-xs font-bold",
                    dept.rankTone === "green" && "bg-[#d1fae5] text-success-fg",
                    dept.rankTone === "blue" && "bg-[#d5e3fd] text-primary",
                    dept.rankTone === "amber" && "bg-warning-muted text-[#92400e]"
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
                <span
                  className={cn(
                    "inline-block rounded px-1.5 text-[10px] font-bold",
                    dept.badgeTone === "amber"
                      ? "text-[#b45309]"
                      : "bg-[#d1fae5]/60 text-success-fg"
                  )}
                >
                  {dept.badge}
                </span>
              </div>
            </div>
            <div className="relative mt-2 h-2 rounded bg-[#e6e8ea]">
              <div
                className="absolute inset-y-0 left-0 rounded"
                style={{ width: `${dept.rate}%`, background: dept.barColor }}
              />
              <div
                className="absolute top-0 bottom-0 w-px bg-text-secondary"
                style={{ left: "90%" }}
                aria-hidden
              />
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
