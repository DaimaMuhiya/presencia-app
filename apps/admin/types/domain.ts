export type DepartmentId =
  | "dept-engineering"
  | "dept-product"
  | "dept-legal"
  | "dept-operations"
  | "dept-support";

export type EmployeeStatus = "active" | "on_leave" | "inactive";
export type TodayAttendanceStatus =
  | "on_time"
  | "late"
  | "remote"
  | "planned_leave"
  | "unexcused_absence";

export type AttendanceLogStatus =
  | "on_time"
  | "late"
  | "early_leave"
  | "absent"
  | "remote";

export type TerminalStatus = "online" | "degraded" | "offline";
export type QrCodeStatus = "active" | "rotated" | "revoked";

export type Department = {
  id: DepartmentId;
  name: string;
  headcount: number;
  campus: string;
  targetAttendanceRate: number;
};

export type Employee = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: DepartmentId;
  role: string;
  status: EmployeeStatus;
  todayStatus: TodayAttendanceStatus;
  hiredAt: string;
  phone: string;
};

export type Checkpoint = {
  id: string;
  name: string;
  departmentId?: DepartmentId;
  geofenceRadiusM: number;
};

export type Terminal = {
  id: string;
  name: string;
  location: string;
  checkpointId: string;
  status: TerminalStatus;
  lastSyncAt: string;
  firmware: string;
};

export type QrCodeRecord = {
  id: string;
  label: string;
  token: string;
  terminalId: string;
  checkpointId: string;
  status: QrCodeStatus;
  createdAt: string;
  rotatedAt?: string;
  scanCount: number;
};

export type AttendanceRecord = {
  id: string;
  employeeId: string;
  departmentId: DepartmentId;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  terminalId: string | null;
  checkpointName: string;
  verification: string;
  status: AttendanceLogStatus;
  delayMinutes: number | null;
  notes?: string;
};

export type OperationalAlert = {
  id: string;
  title: string;
  time: string;
  body: string;
  tone: "warning" | "danger" | "info";
};

export type ExportHistoryEntry = {
  id: string;
  category: string;
  format: "csv" | "xlsx" | "pdf";
  rangeLabel: string;
  createdAt: string;
  rowCount: number;
  fileName: string;
};

export type OrganizationSettings = {
  name: string;
  legalName: string;
  campus: string;
  timezone: string;
  address: string;
  supportEmail: string;
};

export type AttendanceRulesSettings = {
  workdayStart: string;
  workdayEnd: string;
  lateGraceMinutes: number;
  geofenceEnforced: boolean;
  remoteMissionsEnabled: boolean;
  autoCheckoutEnabled: boolean;
};

export type QrTerminalPreferences = {
  rotationIntervalMinutes: number;
  dynamicQrEnabled: boolean;
  protocolVersion: string;
  offlineFallbackEnabled: boolean;
};

export type AppPreferences = {
  locale: string;
  dateFormat: string;
  density: "comfortable" | "compact";
  demoBanner: boolean;
};

export type AdminProfileSettings = {
  name: string;
  email: string;
  role: string;
  phone: string;
  timezone: string;
};

export type DemoSettings = {
  profile: AdminProfileSettings;
  organization: OrganizationSettings;
  attendanceRules: AttendanceRulesSettings;
  qrTerminal: QrTerminalPreferences;
  app: AppPreferences;
};

export type WorkforceSnapshot = {
  totalWorkforce: number;
  onTimeArrivals: number;
  lateArrivals: number;
  physicalAttendance: number;
  remoteMissions: number;
  plannedLeave: number;
  unexcusedAbsences: number;
  absentToday: number;
  presentRate: number;
};
