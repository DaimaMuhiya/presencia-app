"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MoreHorizontal, Search } from "lucide-react";
import { paginate, sortBy } from "@/features/demo/metrics";
import { useDemoStore } from "@/features/demo/demo-store";
import { departmentName, attendanceLogLabel } from "@/lib/labels";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function DashboardLiveTable() {
  const { employees, attendanceRecords, departments, referenceDate } =
    useDemoStore();
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  type LiveRow = {
    id: string;
    name: string;
    employeeCode: string;
    department: string;
    departmentId: string;
    checkpoint: string;
    checkIn: string;
    checkOut: string | null;
    verification: string;
    status: string;
    statusLabel: string;
    late: boolean;
  };

  const rows = useMemo(() => {
    const today = attendanceRecords.filter(
      (r) =>
        r.date === referenceDate &&
        r.checkIn &&
        (r.status === "on_time" || r.status === "late" || r.status === "remote")
    );

    const result: LiveRow[] = [];
    for (const record of today) {
      const employee = employees.find((e) => e.id === record.employeeId);
      if (!employee) continue;
      result.push({
        id: record.id,
        name: `${employee.firstName} ${employee.lastName}`,
        employeeCode: employee.employeeCode,
        department: departmentName(departments, record.departmentId),
        departmentId: record.departmentId,
        checkpoint: record.checkpointName,
        checkIn: record.checkIn ?? "",
        checkOut: record.checkOut,
        verification: record.verification,
        status: record.status,
        statusLabel: attendanceLogLabel(record.status),
        late: record.status === "late",
      });
    }
    return result;
  }, [attendanceRecords, employees, departments, referenceDate]);

  const filtered = useMemo(() => {
    let list = rows;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.employeeCode.toLowerCase().includes(q)
      );
    }
    if (departmentId !== "all") {
      list = list.filter((r) => r.departmentId === departmentId);
    }
    if (status !== "all") {
      list = list.filter((r) => r.status === status);
    }
    return sortBy(list, (r) => r.checkIn ?? "", "desc");
  }, [rows, search, departmentId, status]);

  const paged = paginate(filtered, page, 8);

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
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Filter employee or ID..."
              className="h-8 w-full min-w-[12rem] pl-8 text-xs"
            />
          </label>
          <Select
            className="h-8 text-xs"
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
          <Select
            className="h-8 text-xs"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All statuses</option>
            <option value="on_time">On-Time</option>
            <option value="late">Late</option>
            <option value="remote">Remote</option>
          </Select>
          <Link href="/attendance" className="text-xs font-bold text-primary">
            View full logs
          </Link>
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
            {paged.items.map((row) => (
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
                        {row.employeeCode}
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
                      row.status === "on_time" || row.status === "remote"
                        ? "bg-[#d1fae5] text-success-fg"
                        : "bg-warning-muted text-[#92400e]"
                    )}
                  >
                    {row.statusLabel}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <button type="button" className="text-text-secondary">
                    <MoreHorizontal className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="mt-4 border-t border-border/40 pt-3">
        <Pagination
          page={paged.page}
          pages={paged.pages}
          from={paged.from}
          to={paged.to}
          total={paged.total}
          onPageChange={setPage}
        />
      </footer>
    </section>
  );
}
