"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/providers/toast-provider";
import { useDemoStore } from "@/features/demo/demo-store";
import {
  downloadPdfTable,
  downloadTextFile,
  downloadXlsx,
  rowsToCsv,
} from "@/lib/export-files";
import { departmentName, attendanceLogLabel, todayStatusLabel } from "@/lib/labels";
import type {
  AttendanceRecord,
  Department,
  Employee,
  ExportHistoryEntry,
  QrCodeRecord,
} from "@/types/domain";

type Category = "attendance" | "employees" | "qr";

export function ExportView() {
  const {
    employees,
    attendanceRecords,
    qrCodes,
    departments,
    exportHistory,
    addExportHistory,
  } = useDemoStore();
  const { push } = useToast();

  const [category, setCategory] = useState<Category>("attendance");
  const [format, setFormat] = useState<"csv" | "xlsx" | "pdf">("csv");
  const [departmentId, setDepartmentId] = useState("all");
  const [status, setStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("2023-10-18");
  const [dateTo, setDateTo] = useState("2023-10-25");

  const preview = useMemo(() => buildRows(category, {
    employees,
    attendanceRecords,
    qrCodes,
    departments,
    departmentId,
    status,
    dateFrom,
    dateTo,
  }), [
    category,
    employees,
    attendanceRecords,
    qrCodes,
    departments,
    departmentId,
    status,
    dateFrom,
    dateTo,
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Export Tool"
        description="Generate real CSV, Excel or PDF files from local demonstration data."
      />

      <div className="grid gap-4 rounded bg-surface p-5 lg:grid-cols-2">
        <label className="text-xs font-semibold text-text-secondary">
          Data category
          <Select
            className="mt-1 w-full"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            <option value="attendance">Attendance logs</option>
            <option value="employees">Employee directory</option>
            <option value="qr">QR inventory</option>
          </Select>
        </label>
        <label className="text-xs font-semibold text-text-secondary">
          Format
          <Select
            className="mt-1 w-full"
            value={format}
            onChange={(e) => setFormat(e.target.value as "csv" | "xlsx" | "pdf")}
          >
            <option value="csv">CSV</option>
            <option value="xlsx">Excel (.xlsx)</option>
            <option value="pdf">PDF</option>
          </Select>
        </label>
        {category !== "qr" ? (
          <>
            <label className="text-xs font-semibold text-text-secondary">
              Department
              <Select
                className="mt-1 w-full"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
              >
                <option value="all">All</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </label>
            <label className="text-xs font-semibold text-text-secondary">
              Status filter
              <Select
                className="mt-1 w-full"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="all">All</option>
                {category === "attendance" ? (
                  <>
                    <option value="on_time">On-Time</option>
                    <option value="late">Late</option>
                    <option value="remote">Remote</option>
                    <option value="absent">Absent</option>
                  </>
                ) : (
                  <>
                    <option value="active">Active</option>
                    <option value="on_leave">On leave</option>
                  </>
                )}
              </Select>
            </label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </>
        ) : null}
      </div>

      <article className="rounded bg-surface p-5">
        <h2 className="font-display text-base font-bold">Preview</h2>
        <p className="mt-1 text-xs text-text-secondary">
          {preview.rows.length} row(s) ready · headers: {preview.headers.join(", ")}
        </p>
        <ExportPreviewTable headers={preview.headers} rows={preview.rows.slice(0, 5)} />
        <Button
          className="mt-4"
          onClick={() => {
            if (!preview.rows.length) {
              push({
                tone: "error",
                title: "Nothing to export",
                description: "Widen filters or choose another category.",
              });
              return;
            }
            const stamp = new Date().toISOString().slice(0, 10);
            const base = `${category}-${stamp}`;
            if (format === "csv") {
              downloadTextFile(
                rowsToCsv(preview.headers, preview.rows),
                `${base}.csv`
              );
            } else if (format === "xlsx") {
              downloadXlsx("Export", preview.headers, preview.rows, `${base}.xlsx`);
            } else {
              downloadPdfTable(
                `Presencia ${category} export`,
                preview.headers,
                preview.rows.map((r) => r.map(String)),
                `${base}.pdf`
              );
            }
            const entry: ExportHistoryEntry = {
              id: `exp-${Date.now()}`,
              category: category,
              format,
              rangeLabel: `${dateFrom} – ${dateTo}`,
              createdAt: new Date().toISOString(),
              rowCount: preview.rows.length,
              fileName: `${base}.${format === "xlsx" ? "xlsx" : format}`,
            };
            addExportHistory(entry);
            push({
              tone: "success",
              title: "File downloaded",
              description: `${preview.rows.length} rows exported locally.`,
            });
          }}
        >
          Download file
        </Button>
      </article>

      <article className="rounded bg-surface p-5">
        <h2 className="font-display text-base font-bold">Export history</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {exportHistory.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap justify-between gap-2 rounded bg-muted/70 px-3 py-2"
            >
              <span className="font-semibold">{item.fileName}</span>
              <span className="text-text-secondary">
                {item.category} · {item.rowCount} rows ·{" "}
                {new Date(item.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}

function buildRows(
  category: Category,
  ctx: {
    employees: Employee[];
    attendanceRecords: AttendanceRecord[];
    qrCodes: QrCodeRecord[];
    departments: Department[];
    departmentId: string;
    status: string;
    dateFrom: string;
    dateTo: string;
  }
) {
  if (category === "employees") {
    const headers = ["Code", "Name", "Email", "Department", "Status", "Today"];
    let list = ctx.employees;
    if (ctx.departmentId !== "all") {
      list = list.filter((e) => e.departmentId === ctx.departmentId);
    }
    if (ctx.status !== "all") {
      list = list.filter((e) => e.status === ctx.status);
    }
    const rows = list.map((e) => [
      e.employeeCode,
      `${e.firstName} ${e.lastName}`,
      e.email,
      departmentName(ctx.departments, e.departmentId),
      e.status,
      todayStatusLabel(e.todayStatus),
    ]);
    return { headers, rows };
  }

  if (category === "qr") {
    const headers = ["Label", "Token", "Terminal", "Status", "Scans"];
    const rows = ctx.qrCodes.map((q) => [
      q.label,
      q.token,
      q.terminalId,
      q.status,
      q.scanCount,
    ]);
    return { headers, rows };
  }

  const headers = [
    "Date",
    "Employee ID",
    "Department",
    "Check-in",
    "Check-out",
    "Status",
    "Verification",
  ];
  let list = ctx.attendanceRecords.filter(
    (r) => r.date >= ctx.dateFrom && r.date <= ctx.dateTo
  );
  if (ctx.departmentId !== "all") {
    list = list.filter((r) => r.departmentId === ctx.departmentId);
  }
  if (ctx.status !== "all") {
    list = list.filter((r) => r.status === ctx.status);
  }
  const rows = list.map((r) => [
    r.date,
    r.employeeId,
    departmentName(ctx.departments, r.departmentId),
    r.checkIn,
    r.checkOut,
    attendanceLogLabel(r.status),
    r.verification,
  ]);
  return { headers, rows };
}

function ExportPreviewTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | number | null | undefined)[][];
}) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[480px] text-xs">
        <thead>
          <tr className="bg-muted/60">
            {headers.map((h) => (
              <th key={h} className="px-2 py-2 text-left font-bold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-border/40">
              {row.map((cell, j) => (
                <td key={j} className="px-2 py-1.5">
                  {cell ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
