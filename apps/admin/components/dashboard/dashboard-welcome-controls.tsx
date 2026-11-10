"use client";

import { Download, MapPin, Plus } from "lucide-react";
import Link from "next/link";
import { useDemoStore } from "@/features/demo/demo-store";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/providers/toast-provider";

const PERIODS = [
  { id: "today", label: "Today" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "custom", label: "Custom" },
] as const;

export function DashboardWelcomeControls() {
  const {
    settings,
    departments,
    dashboardFilters,
    setDashboardFilters,
  } = useDemoStore();
  const { push } = useToast();

  return (
    <section className="flex flex-col gap-6 border-b border-transparent pb-2 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-md space-y-2.5">
        <h2 className="font-display text-[30px] font-extrabold leading-9 tracking-tight text-text-primary">
          Good morning, {settings.profile.name.split(" ")[0]}
        </h2>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded bg-[#e6e8ea] px-3 py-1 text-xs font-semibold text-text-secondary">
            <MapPin className="size-3 text-primary" aria-hidden />
            {settings.organization.campus}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded bg-success-muted px-3 py-1 text-xs font-medium text-success-fg">
            <span className="size-1.5 rounded bg-success" aria-hidden />
            Live data stream active
          </span>
        </div>
        <p className="text-xs font-medium leading-4 tracking-wide text-text-secondary">
          Wednesday, October 25, 2023 • Comprehensive Operations Overview &
          Physical Geofence Metrics
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-3 sm:max-w-md">
        <div
          className="inline-flex flex-wrap gap-1 rounded bg-muted p-1"
          role="tablist"
          aria-label="Période"
        >
          {PERIODS.map((period) => (
            <button
              key={period.id}
              type="button"
              role="tab"
              aria-selected={dashboardFilters.period === period.id}
              onClick={() => {
                if (period.id === "custom") {
                  push({
                    tone: "info",
                    title: "Custom range (démo)",
                    description:
                      "Sélection de plage personnalisée simulée — intégration calendrier à venir.",
                  });
                  return;
                }
                setDashboardFilters({ period: period.id });
              }}
              className={
                dashboardFilters.period === period.id
                  ? "rounded bg-surface px-3.5 py-1.5 text-xs font-bold text-primary"
                  : "rounded px-3 py-1.5 text-xs font-medium text-text-secondary"
              }
            >
              {period.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            aria-label="Département"
            value={dashboardFilters.departmentId}
            onChange={(e) =>
              setDashboardFilters({ departmentId: e.target.value })
            }
          >
            <option value="all">All departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>

          <Link
            href="/export"
            className="inline-flex items-center gap-2 rounded bg-surface px-4 py-2 text-xs font-semibold text-text-secondary shadow-[0_0_0_1px_rgba(230,232,234,0.7)]"
          >
            <Download className="size-3" aria-hidden />
            Download Report
          </Link>
        </div>

        <Link
          href="/qr-management"
          className="inline-flex w-fit items-center gap-2 rounded bg-linear-to-r from-primary to-primary-hover px-4 py-2.5 text-xs font-semibold text-white shadow-sm"
        >
          <Plus className="size-3.5" aria-hidden />
          New QR Pass
        </Link>
      </div>
    </section>
  );
}
