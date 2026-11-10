import type { DashboardKpi } from "@/types/dashboard";
import type { WorkforceSnapshot } from "@/types/domain";

export function buildDashboardKpis(
  workforce: WorkforceSnapshot
): DashboardKpi[] {
  return [
    {
      id: "workforce",
      label: "Total Workforce",
      value: workforce.totalWorkforce,
      delta: "+2.6%",
      deltaPositive: true,
      subtitle: "MoM growth consolidated",
      iconTone: "blue",
      footer: { left: "Active contracts", right: "478 signed" },
    },
    {
      id: "present",
      label: "Present Today",
      value: workforce.physicalAttendance,
      delta: `${workforce.presentRate}%`,
      deltaPositive: true,
      subtitle: "Physical attendance (on-time + late)",
      iconTone: "green",
      progress: workforce.presentRate,
      footer: { left: "On-time", right: `${workforce.onTimeArrivals}`, rightTone: "green" },
    },
    {
      id: "absent",
      label: "Absent Today",
      value: workforce.absentToday,
      delta: `${Math.round((workforce.absentToday / workforce.totalWorkforce) * 1000) / 10}%`,
      subtitle: "Planned leave + unexcused",
      iconTone: "rose",
      footer: {
        left: "Planned leave",
        right: `${workforce.plannedLeave}`,
        rightTone: "green",
      },
    },
    {
      id: "late",
      label: "Late Arrivals",
      value: workforce.lateArrivals,
      delta: "-12%",
      deltaPositive: true,
      subtitle: "Subset of physical attendance",
      iconTone: "amber",
      footer: { left: "On-time", right: `${workforce.onTimeArrivals}`, rightTone: "green" },
    },
    {
      id: "remote",
      label: "Remote Missions",
      value: workforce.remoteMissions,
      delta: "Stable",
      subtitle: "Authorized off-site missions",
      iconTone: "blue",
      footer: { left: "Verified GPS", right: `${workforce.remoteMissions} active` },
    },
  ];
}

export const TREND_SERIES = [
  { label: "Mon", present: 410, absent: 45, late: 25 },
  { label: "Tue", present: 418, absent: 40, late: 22 },
  { label: "Wed", present: 405, absent: 52, late: 23 },
  { label: "Thu", present: 415, absent: 44, late: 21 },
  { label: "Fri", present: 422, absent: 38, late: 20 },
  { label: "Sat", present: 120, absent: 8, late: 4 },
  { label: "Today", present: 422, absent: 38, late: 20 },
] as const;
