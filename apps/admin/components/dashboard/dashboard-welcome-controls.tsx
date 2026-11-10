import type { ReactNode } from "react";
import { Download, MapPin, Plus } from "lucide-react";
import { DEMO_WELCOME } from "@/features/dashboard/demo-data";

const PERIODS = ["Today", "Last 7 days", "Last 30 days", "Custom"] as const;

export function DashboardWelcomeControls() {
  return (
    <section className="flex flex-col gap-6 border-b border-transparent pb-2 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-md space-y-2.5">
        <h2 className="font-display text-[30px] font-extrabold leading-9 tracking-tight text-text-primary">
          {DEMO_WELCOME.greeting}
        </h2>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded bg-[#e6e8ea] px-3 py-1 text-xs font-semibold text-text-secondary">
            <MapPin className="size-3 text-primary" aria-hidden />
            {DEMO_WELCOME.campus}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded bg-success-muted px-3 py-1 text-xs font-medium text-success-fg">
            <span className="size-1.5 rounded bg-success" aria-hidden />
            Live data stream active
          </span>
        </div>
        <p className="text-xs font-medium leading-4 tracking-wide text-text-secondary">
          {DEMO_WELCOME.dateLine}
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-3 sm:max-w-md">
        <div
          className="inline-flex flex-wrap gap-1 rounded bg-muted p-1"
          role="tablist"
          aria-label="Période"
        >
          {PERIODS.map((period, i) => (
            <button
              key={period}
              type="button"
              disabled
              role="tab"
              aria-selected={i === 0}
              className={
                i === 0
                  ? "rounded bg-surface px-3.5 py-1.5 text-xs font-bold text-primary"
                  : "rounded px-3 py-1.5 text-xs font-medium text-text-secondary"
              }
            >
              {period}
            </button>
          ))}
        </div>

        <ControlsRow>
          <select
            disabled
            className="h-9 min-w-[12rem] appearance-none rounded bg-surface px-3.5 pr-9 text-xs font-semibold text-text-primary"
            defaultValue="all"
            aria-label="Département"
          >
            <option value="all">All departments</option>
            <option>Engineering</option>
            <option>Operations</option>
          </select>

          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 rounded bg-surface px-4 py-2 text-xs font-semibold text-text-secondary"
          >
            <Download className="size-3" aria-hidden />
            Download Report
          </button>
        </ControlsRow>

        <button
          type="button"
          disabled
          className="inline-flex w-fit items-center gap-2 rounded bg-linear-to-r from-primary to-primary-hover px-4 py-2.5 text-xs font-semibold text-white shadow-sm"
        >
          <Plus className="size-3.5" aria-hidden />
          New QR Pass
        </button>
      </div>
    </section>
  );
}

function ControlsRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">{children}</div>
  );
}
