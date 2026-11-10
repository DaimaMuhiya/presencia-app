"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { paginate, sortBy } from "@/features/demo/metrics";
import { useDemoStore } from "@/features/demo/demo-store";
import { attendanceLogLabel, departmentName } from "@/lib/labels";
import type { AttendanceRecord } from "@/types/domain";

export function AttendanceView() {
  const { attendanceRecords, employees, departments, terminals } = useDemoStore();
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("all");
  const [terminalId, setTerminalId] = useState("all");
  const [status, setStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("2023-10-18");
  const [dateTo, setDateTo] = useState("2023-10-25");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<AttendanceRecord | null>(null);

  const enriched = useMemo(() => {
    return attendanceRecords.map((record) => {
      const employee = employees.find((e) => e.id === record.employeeId);
      return {
        record,
        employeeName: employee
          ? `${employee.firstName} ${employee.lastName}`
          : "Unknown",
        employeeCode: employee?.employeeCode ?? "—",
      };
    });
  }, [attendanceRecords, employees]);

  const filtered = useMemo(() => {
    let list = enriched.filter(
      (row) => row.record.date >= dateFrom && row.record.date <= dateTo
    );
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.employeeName.toLowerCase().includes(q) ||
          r.employeeCode.toLowerCase().includes(q)
      );
    }
    if (departmentId !== "all") {
      list = list.filter((r) => r.record.departmentId === departmentId);
    }
    if (terminalId !== "all") {
      list = list.filter((r) => r.record.terminalId === terminalId);
    }
    if (status !== "all") {
      list = list.filter((r) => r.record.status === status);
    }
    return sortBy(list, (r) => `${r.record.date}${r.record.checkIn ?? ""}`, "desc");
  }, [
    enriched,
    search,
    departmentId,
    terminalId,
    status,
    dateFrom,
    dateTo,
  ]);

  const paged = paginate(filtered, page, 15);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Attendance Logs"
        description="Historical check-ins with verification metadata (données locales)."
      />

      <div className="grid gap-3 rounded bg-surface p-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
          <Input
            className="pl-10"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
        <Select
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
          value={terminalId}
          onChange={(e) => {
            setTerminalId(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All terminals</option>
          {terminals.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>
        <Select
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
          <option value="absent">Absent</option>
          <option value="early_leave">Early leave</option>
        </Select>
      </div>

      {paged.total === 0 ? (
        <EmptyState title="No attendance records" description="Try widening the date range or filters." />
      ) : (
        <div className="overflow-x-auto rounded bg-surface">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-muted/60 text-xs font-bold uppercase text-text-secondary">
              <tr>
                {["Date", "Employee", "Department", "Check-in", "Check-out", "Terminal", "Status", ""].map(
                  (h) => (
                    <th key={h || "a"} className="px-4 py-3">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {paged.items.map(({ record, employeeName, employeeCode }) => (
                <tr key={record.id} className="border-t border-border/50">
                  <td className="px-4 py-3 font-medium">{record.date}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{employeeName}</p>
                    <p className="text-xs text-text-secondary">{employeeCode}</p>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {departmentName(departments, record.departmentId)}
                  </td>
                  <td className="px-4 py-3">{record.checkIn ?? "—"}</td>
                  <td className="px-4 py-3">{record.checkOut ?? "—"}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {terminals.find((t) => t.id === record.terminalId)?.name ??
                      "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={attendanceLogLabel(record.status)}
                      tone={
                        record.status === "late"
                          ? "amber"
                          : record.status === "absent"
                            ? "rose"
                            : "green"
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="text-xs font-bold text-primary"
                      onClick={() => setDetail(record)}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-border/50 p-4">
            <Pagination
              page={paged.page}
              pages={paged.pages}
              from={paged.from}
              to={paged.to}
              total={paged.total}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      <Dialog
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title="Attendance record"
        size="lg"
      >
        {detail ? (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {[
              ["Checkpoint", detail.checkpointName],
              ["Verification", detail.verification],
              ["Delay (min)", detail.delayMinutes ?? "—"],
              ["Notes", detail.notes ?? "—"],
              ["Status", attendanceLogLabel(detail.status)],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs font-bold uppercase text-text-secondary">{k}</dt>
                <dd className="text-text-primary">{v}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </Dialog>
    </div>
  );
}
