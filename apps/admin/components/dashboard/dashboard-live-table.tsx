import { MoreHorizontal, Search } from "lucide-react";
import {
  DEMO_LIVE_ATTENDANCE,
  DEMO_LIVE_PAGINATION,
} from "@/features/dashboard/demo-data";
import { cn } from "@/lib/utils";

export function DashboardLiveTable() {
  return (
    <section className="rounded bg-surface p-6">
      <header className="flex flex-col gap-4 pb-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-display text-base font-bold leading-6 text-text-primary">
            Live Attendance Activity
          </h3>
          <span className="inline-flex items-center gap-1.5 rounded bg-success-muted py-1 pl-2.5 pr-9 text-[11px] font-semibold text-success-fg">
            <span className="size-1.5 rounded bg-success" aria-hidden />
            Streaming
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 size-2.5 -translate-y-1/2 text-text-secondary" />
            <input
              disabled
              placeholder="Filter employee or ID..."
              className="h-8 w-48 rounded bg-muted pl-8 pr-3 text-xs text-text-primary placeholder:text-text-secondary/60"
            />
          </label>
          <select
            disabled
            className="h-8 rounded bg-muted px-3 text-xs font-medium text-text-primary"
            defaultValue="dept"
          >
            <option value="dept">Department</option>
          </select>
          <select
            disabled
            className="h-8 rounded bg-muted px-3 text-xs font-medium text-text-primary"
            defaultValue="status"
          >
            <option value="status">Status</option>
          </select>
          <button
            type="button"
            disabled
            className="text-xs font-bold text-primary"
          >
            View full logs
          </button>
        </div>
      </header>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-xs">
          <thead>
            <tr className="rounded bg-muted/60 text-[11px] font-bold uppercase tracking-wide text-text-secondary">
              {[
                "Employee",
                "Department",
                "Checkpoint",
                "Check-in",
                "Check-out",
                "Verification",
                "Status",
                "",
              ].map((h) => (
                <th key={h || "actions"} className="px-4 py-4 font-bold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEMO_LIVE_ATTENDANCE.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-border/40",
                  row.late && "bg-amber-50/20"
                )}
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary"
                      aria-hidden
                    >
                      {row.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                    <div>
                      <p className="font-bold text-text-primary">{row.name}</p>
                      <p className="text-[10px] text-text-secondary">
                        {row.employeeId}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 font-medium text-text-secondary">
                  {row.department}
                </td>
                <td className="px-4 py-4 font-medium text-text-primary">
                  {row.checkpoint}
                </td>
                <td className="px-4 py-4 font-bold text-text-primary">
                  {row.checkIn}
                </td>
                <td className="px-4 py-4 text-text-secondary">
                  {row.checkOut ?? "—"}
                </td>
                <td className="px-4 py-4 text-text-secondary">
                  {row.verification}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-bold",
                      row.status === "on-time"
                        ? "bg-[#d1fae5] text-success-fg"
                        : "bg-warning-muted text-[#92400e]"
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded",
                        row.status === "on-time"
                          ? "bg-success-dark"
                          : "bg-amber-600"
                      )}
                    />
                    {row.statusLabel}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <button type="button" disabled className="text-text-secondary">
                    <MoreHorizontal className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3">
        <p className="text-xs text-text-secondary">
          Showing {DEMO_LIVE_PAGINATION.from}–{DEMO_LIVE_PAGINATION.to} of{" "}
          {DEMO_LIVE_PAGINATION.total} live events
        </p>
        <div className="flex items-center gap-1">
          <PageBtn label="Previous" muted />
          <PageBtn label="1" active />
          <PageBtn label="2" />
          <PageBtn label="3" />
          <span className="px-1 text-xs text-text-secondary">…</span>
          <PageBtn label="85" />
          <PageBtn label="Next" />
        </div>
      </footer>
    </section>
  );
}

function PageBtn({
  label,
  active,
  muted,
}: {
  label: string;
  active?: boolean;
  muted?: boolean;
}) {
  return (
    <button
      type="button"
      disabled
      className={cn(
        "rounded px-3 py-1.5 text-xs",
        active && "bg-primary font-bold text-white",
        muted && "bg-muted opacity-40",
        !active && !muted && "bg-muted text-text-secondary"
      )}
    >
      {label}
    </button>
  );
}
