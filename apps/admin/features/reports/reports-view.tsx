"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/layout/page-header";
import { Select } from "@/components/ui/select";
import { buildWorkforceSnapshot, departmentAttendanceRates } from "@/features/demo/metrics";
import { TREND_SERIES } from "@/features/dashboard/selectors";
import { AttendanceTrendChart } from "@/components/charts/attendance-trend-chart";
import { useDemoStore } from "@/features/demo/demo-store";
import { departmentName } from "@/lib/labels";

export function ReportsView() {
  const {
    employees,
    attendanceRecords,
    departments,
    referenceDate,
    workforce,
  } = useDemoStore();
  const [range, setRange] = useState("7d");
  const [departmentId, setDepartmentId] = useState("all");

  const snapshot = buildWorkforceSnapshot(employees);

  const deptComparison = useMemo(() => {
    const rates = departmentAttendanceRates(
      departments,
      employees,
      attendanceRecords,
      referenceDate
    );
    return rates.map((r) => ({
      name: departmentName(departments, r.departmentId).split(" ")[0],
      rate: r.rate,
      present: r.present,
      total: r.total,
    }));
  }, [departments, employees, attendanceRecords, referenceDate]);

  const trendData = useMemo(() => {
    const scale =
      range === "30d" ? 1 : range === "7d" ? 1 : 0.85;
    return TREND_SERIES.map((p) =>
      p.label === "Today"
        ? {
            ...p,
            present: Math.round(workforce.physicalAttendance * scale),
            absent: workforce.absentToday,
            late: workforce.lateArrivals,
          }
        : {
            ...p,
            present: Math.round(p.present * scale),
            absent: Math.round(p.absent * scale),
            late: Math.round(p.late * scale),
          }
    );
  }, [range, workforce]);

  const employeeSummary = useMemo(() => {
    const subset =
      departmentId === "all"
        ? employees
        : employees.filter((e) => e.departmentId === departmentId);
    const onTime = subset.filter((e) => e.todayStatus === "on_time").length;
    const late = subset.filter((e) => e.todayStatus === "late").length;
    const absent = subset.filter(
      (e) =>
        e.todayStatus === "planned_leave" ||
        e.todayStatus === "unexcused_absence"
    ).length;
    return { total: subset.length, onTime, late, absent };
  }, [employees, departmentId]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reports"
        description="Summaries derived from the shared demonstration dataset."
        actions={
          <div className="flex flex-wrap gap-2">
            <Select value={range} onChange={(e) => setRange(e.target.value)}>
              <option value="today">Today</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </Select>
            <Select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
            >
              <option value="all">All departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </div>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Workforce", value: snapshot.totalWorkforce },
          { label: "Physical present", value: snapshot.physicalAttendance },
          { label: "Absent today", value: snapshot.absentToday },
          { label: "Late arrivals", value: snapshot.lateArrivals },
        ].map((card) => (
          <article key={card.label} className="rounded bg-surface p-4">
            <p className="text-xs font-bold uppercase text-text-secondary">
              {card.label}
            </p>
            <p className="mt-1 font-display text-2xl font-extrabold">
              {card.value}
            </p>
          </article>
        ))}
      </section>

      <article className="rounded bg-surface p-6">
        <h2 className="font-display text-base font-bold">Attendance trends</h2>
        <div className="mt-4">
          <AttendanceTrendChart data={trendData} />
        </div>
      </article>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded bg-surface p-6">
          <h2 className="font-display text-base font-bold">Department comparison</h2>
          <DepartmentBarChart data={deptComparison} />
        </article>
        <article className="rounded bg-surface p-6">
          <h2 className="font-display text-base font-bold">Employee summary</h2>
          <table className="mt-4 w-full text-sm">
            <tbody>
              {[
                ["Employees in scope", employeeSummary.total],
                ["On-time today", employeeSummary.onTime],
                ["Late today", employeeSummary.late],
                ["Absent today", employeeSummary.absent],
                ["Present rate", `${workforce.presentRate}%`],
              ].map(([label, value]) => (
                <tr key={label} className="border-t border-border/40">
                  <td className="py-2 text-text-secondary">{label}</td>
                  <td className="py-2 text-right font-bold">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>
    </div>
  );
}

function DepartmentBarChart({
  data,
}: {
  data: { name: string; rate: number }[];
}) {
  return (
    <div className="mt-4 h-56 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -20 }}>
          <CartesianGrid strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} unit="%" />
          <Tooltip />
          <Bar dataKey="rate" name="Attendance %" fill="#00236F" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
