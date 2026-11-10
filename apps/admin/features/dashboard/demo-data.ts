import type {
  ArrivalWindow,
  DashboardKpi,
  DepartmentRow,
  LiveAttendanceRow,
  OperationalAlert,
  TrendPoint,
  WorkforceSlice,
} from "@/types/dashboard";

export const DEMO_WELCOME = {
  greeting: "Good morning, Alexandre",
  campus: "HQ - Main Campus",
  dateLine:
    "Wednesday, October 25, 2023 • Comprehensive Operations Overview & Physical Geofence Metrics",
} as const;

export const DEMO_KPIS: DashboardKpi[] = [
  {
    id: "workforce",
    label: "Total Workforce",
    value: 480,
    delta: "+2.6%",
    deltaPositive: true,
    subtitle: "MoM growth consolidated",
    iconTone: "blue",
    footer: { left: "Active contracts", right: "478 signed" },
  },
  {
    id: "present",
    label: "Present Today",
    value: 422,
    delta: "87.5%",
    deltaPositive: true,
    subtitle: "Attendance rate",
    iconTone: "green",
    progress: 87.5,
    footer: { left: "Target", right: "90% goal", rightTone: "green" },
  },
  {
    id: "absent",
    label: "Absent Today",
    value: 38,
    delta: "7.8%",
    subtitle: "Of total workforce",
    iconTone: "rose",
    footer: { left: "Approved leave", right: "22 planned", rightTone: "green" },
  },
  {
    id: "late",
    label: "Late Arrivals",
    value: 20,
    delta: "-12%",
    deltaPositive: true,
    subtitle: "Avg delay: 14 mins",
    iconTone: "amber",
    footer: { left: "Peak window", right: "08:58–09:15", rightTone: "amber" },
  },
];

export const DEMO_TREND_POINTS: TrendPoint[] = [
  { label: "Mon", present: 410, absent: 45, late: 25 },
  { label: "Tue", present: 418, absent: 40, late: 22 },
  { label: "Wed", present: 405, absent: 52, late: 23 },
  { label: "Thu", present: 415, absent: 44, late: 21 },
  { label: "Fri", present: 422, absent: 38, late: 20 },
  { label: "Sat", present: 120, absent: 8, late: 4 },
  { label: "Today", present: 422, absent: 38, late: 20 },
];

export const DEMO_TREND_CALLOUTS = [
  {
    label: "Peak attendance",
    value: "Monday (91.2%)",
    hint: "Highest weekly density",
  },
  {
    label: "Weekly average",
    value: "88.1% (Workdays)",
    hint: "+1.2% vs prior week",
    hintTone: "green" as const,
  },
  {
    label: "Late trend",
    value: "-1.8% Improving",
    hint: "Scanner sync optimized",
  },
];

export const DEMO_WORKFORCE_SLICES: WorkforceSlice[] = [
  { label: "On-Time", value: 342, color: "#00236F" },
  { label: "Late", value: 20, color: "#F59E0B" },
  { label: "Leave", value: 38, color: "#515F74" },
  { label: "Unexcused", value: 12, color: "#F43F5E" },
];

export const DEMO_ARRIVAL_WINDOWS: ArrivalWindow[] = [
  { label: "08:00 – 08:30", percent: "43.6%", width: 43.6, tone: "blue" },
  { label: "08:30 – 09:00", percent: "51.7%", width: 51.7, tone: "indigo" },
  { label: "After 09:00", percent: "4.7%", width: 4.7, tone: "amber" },
];

export const DEMO_DEPARTMENTS: DepartmentRow[] = [
  {
    rank: 1,
    name: "Engineering",
    meta: "128 employees • Terminal A",
    rate: 94.4,
    rateLabel: "Above target",
    badge: "+2.1%",
    rankTone: "green",
    barColor: "#059669",
  },
  {
    rank: 2,
    name: "Product & Design",
    meta: "64 employees • Floor 3",
    rate: 91.7,
    rateLabel: "Stable",
    badge: "On track",
    rankTone: "green",
    barColor: "#10B981",
  },
  {
    rank: 3,
    name: "Legal & Finance",
    meta: "42 employees • Wing B",
    rate: 88.9,
    rateLabel: "Near 90% target",
    badge: "Monitor",
    rankTone: "blue",
    barColor: "#00236F",
  },
  {
    rank: 4,
    name: "Operations & Logistics",
    meta: "186 employees • Terminal B",
    rate: 84.1,
    rateLabel: "Congestion risk",
    badge: "Attention",
    badgeTone: "amber",
    rankTone: "amber",
    barColor: "#F59E0B",
  },
  {
    rank: 5,
    name: "Support & Client Success",
    meta: "60 employees • Remote hybrid",
    rate: 82.2,
    rateLabel: "Below target",
    badge: "Review",
    badgeTone: "amber",
    rankTone: "amber",
    barColor: "#FBBF24",
  },
];

export const DEMO_ALERTS: OperationalAlert[] = [
  {
    id: "terminal-b",
    title: "Terminal B Scanner Congestion",
    time: "09:12 AM",
    body:
      "12 late scans between 08:58 - 09:15. Scanner latency detected (+4.2s delay). Scanner QR re-sync suggested.",
    tone: "warning",
    actions: [
      { label: "Re-sync scanners", primary: true },
      { label: "Dismiss" },
    ],
  },
  {
    id: "geofence",
    title: "Geofence Anomaly — Building C",
    time: "08:47 AM",
    body:
      "4 check-ins logged near outer geofence boundary (420m of 500m radius limit) in Building C corridor.",
    tone: "danger",
    actions: [{ label: "View geofence map", primary: true }],
  },
  {
    id: "qr-rotation",
    title: "Dynamic QR Rotation",
    time: "Synced",
    body:
      "All 6 entrance tablets synchronized on protocol v2.4. Zero token replay attempts recorded.",
    tone: "info",
  },
];

export const DEMO_LIVE_ATTENDANCE: LiveAttendanceRow[] = [
  {
    id: "1",
    name: "Rocquia Yala",
    employeeId: "#EMP-1042",
    department: "Engineering",
    checkpoint: "Terminal A",
    checkIn: "08:22",
    checkOut: null,
    verification: "GPS + QR",
    status: "on-time",
    statusLabel: "On-Time",
  },
  {
    id: "2",
    name: "Benjamin Shako",
    employeeId: "#EMP-0891",
    department: "Product",
    checkpoint: "Floor 3",
    checkIn: "08:05",
    checkOut: null,
    verification: "QR",
    status: "on-time",
    statusLabel: "On-Time",
  },
  {
    id: "3",
    name: "Glodi Kasongo",
    employeeId: "#EMP-0773",
    department: "Operations",
    checkpoint: "Terminal B",
    checkIn: "09:14",
    checkOut: null,
    verification: "GPS",
    status: "late",
    statusLabel: "Late",
    late: true,
  },
  {
    id: "4",
    name: "Derrick Ngokwey",
    employeeId: "#EMP-1120",
    department: "Support",
    checkpoint: "Remote",
    checkIn: "08:31",
    checkOut: null,
    verification: "GPS + QR",
    status: "on-time",
    statusLabel: "On-Time",
  },
  {
    id: "5",
    name: "Marie Luboya",
    employeeId: "#EMP-0934",
    department: "Legal",
    checkpoint: "Wing B",
    checkIn: "09:08",
    checkOut: null,
    verification: "QR",
    status: "late",
    statusLabel: "Late",
    late: true,
  },
];

export const DEMO_LIVE_PAGINATION = {
  from: 1,
  to: 5,
  total: 420,
  page: 1,
  pages: 85,
} as const;
