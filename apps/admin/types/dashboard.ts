export type AttendanceStatus = "ON TIME" | "LATE" | "ABSENT";

export type DashboardKpi = {
  id: string;
  label: string;
  value: number | string;
  delta?: string;
  deltaPositive?: boolean;
  subtitle?: string;
  iconTone: "blue" | "green" | "rose" | "amber";
  footer?: { left: string; right: string; rightTone?: "default" | "green" | "amber" };
  progress?: number;
};

export type TrendPoint = { label: string; present: number; absent: number; late: number };

export type WorkforceSlice = {
  label: string;
  value: number;
  color: string;
};

export type ArrivalWindow = {
  label: string;
  percent: string;
  width: number;
  tone: "blue" | "indigo" | "amber";
};

export type DepartmentRow = {
  rank: number;
  name: string;
  meta: string;
  rate: number;
  rateLabel: string;
  badge?: string;
  badgeTone?: "green" | "neutral" | "amber";
  rankTone: "green" | "blue" | "amber";
  barColor: string;
};

export type OperationalAlert = {
  id: string;
  title: string;
  time: string;
  body: string;
  tone: "warning" | "danger" | "info";
  actions?: { label: string; primary?: boolean }[];
};

export type LiveAttendanceRow = {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  checkpoint: string;
  checkIn: string;
  checkOut: string | null;
  verification: string;
  status: "on-time" | "late";
  statusLabel: string;
  late?: boolean;
};
