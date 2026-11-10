import type {
  AdminProfileSettings,
  AppPreferences,
  AttendanceRecord,
  AttendanceRulesSettings,
  Checkpoint,
  Department,
  Employee,
  ExportHistoryEntry,
  OperationalAlert,
  OrganizationSettings,
  QrCodeRecord,
  QrTerminalPreferences,
  Terminal,
  TodayAttendanceStatus,
} from "@/types/domain";
import { DEMO_WORKFORCE } from "./workforce-constants";

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = [
  "Rocquia", "Benjamin", "Glodi", "Derrick", "Marie", "Patrick", "Joyce", "Merveille",
  "André", "Claudine", "Fabrice", "Grace", "Henri", "Irène", "Joseph", "Ketsia", "Lionel",
  "Naomi", "Olivier", "Prisca", "Quentin", "Ruth", "Samuel", "Thérèse", "Ulrich", "Véronique",
];
const LAST = [
  "Yala", "Shako", "Kasongo", "Ngokwey", "Luboya", "Mutombo", "Kabasele", "Tshimanga",
  "Ilunga", "Mwanza", "Banza", "Kalonji", "Mpiana", "Kabongo", "Ngoy", "Kalala", "Mwamba",
];

export const DEMO_DEPARTMENTS: Department[] = [
  {
    id: "dept-engineering",
    name: "Engineering",
    headcount: 128,
    campus: "Terminal A",
    targetAttendanceRate: 90,
  },
  {
    id: "dept-product",
    name: "Product & Design",
    headcount: 64,
    campus: "Floor 3",
    targetAttendanceRate: 90,
  },
  {
    id: "dept-legal",
    name: "Legal & Finance",
    headcount: 42,
    campus: "Wing B",
    targetAttendanceRate: 88,
  },
  {
    id: "dept-operations",
    name: "Operations & Logistics",
    headcount: 186,
    campus: "Terminal B",
    targetAttendanceRate: 85,
  },
  {
    id: "dept-support",
    name: "Support & Client Success",
    headcount: 60,
    campus: "Remote hybrid",
    targetAttendanceRate: 85,
  },
];

export const DEMO_CHECKPOINTS: Checkpoint[] = [
  { id: "cp-ta", name: "Terminal A Gate", departmentId: "dept-engineering", geofenceRadiusM: 500 },
  { id: "cp-f3", name: "Floor 3 Lobby", departmentId: "dept-product", geofenceRadiusM: 420 },
  { id: "cp-wb", name: "Wing B Entrance", departmentId: "dept-legal", geofenceRadiusM: 380 },
  { id: "cp-tb", name: "Terminal B Dock", departmentId: "dept-operations", geofenceRadiusM: 500 },
  { id: "cp-remote", name: "Remote Mission", geofenceRadiusM: 0 },
  { id: "cp-bc", name: "Building C Corridor", geofenceRadiusM: 420 },
];

export const DEMO_TERMINALS: Terminal[] = [
  {
    id: "term-a1",
    name: "Scanner A-01",
    location: "Terminal A — Main",
    checkpointId: "cp-ta",
    status: "online",
    lastSyncAt: "2023-10-25T09:12:00Z",
    firmware: "v2.4.1",
  },
  {
    id: "term-a2",
    name: "Scanner A-02",
    location: "Terminal A — Annex",
    checkpointId: "cp-ta",
    status: "online",
    lastSyncAt: "2023-10-25T09:10:00Z",
    firmware: "v2.4.1",
  },
  {
    id: "term-f3",
    name: "Tablet F3-01",
    location: "Floor 3 — Reception",
    checkpointId: "cp-f3",
    status: "online",
    lastSyncAt: "2023-10-25T09:08:00Z",
    firmware: "v2.4.0",
  },
  {
    id: "term-wb",
    name: "Scanner WB-01",
    location: "Wing B",
    checkpointId: "cp-wb",
    status: "degraded",
    lastSyncAt: "2023-10-25T08:55:00Z",
    firmware: "v2.3.9",
  },
  {
    id: "term-b1",
    name: "Scanner B-01",
    location: "Terminal B — Dock 1",
    checkpointId: "cp-tb",
    status: "degraded",
    lastSyncAt: "2023-10-25T09:12:00Z",
    firmware: "v2.4.1",
  },
  {
    id: "term-b2",
    name: "Scanner B-02",
    location: "Terminal B — Dock 2",
    checkpointId: "cp-tb",
    status: "online",
    lastSyncAt: "2023-10-25T09:11:00Z",
    firmware: "v2.4.1",
  },
  {
    id: "term-bc",
    name: "Tablet BC-01",
    location: "Building C",
    checkpointId: "cp-bc",
    status: "online",
    lastSyncAt: "2023-10-25T08:47:00Z",
    firmware: "v2.4.1",
  },
  {
    id: "term-remote",
    name: "Remote Token Hub",
    location: "Cloud",
    checkpointId: "cp-remote",
    status: "online",
    lastSyncAt: "2023-10-25T09:00:00Z",
    firmware: "v2.4.1",
  },
];

function buildTodayStatusQueue(): TodayAttendanceStatus[] {
  const queue: TodayAttendanceStatus[] = [];
  const push = (status: TodayAttendanceStatus, count: number) => {
    for (let i = 0; i < count; i++) queue.push(status);
  };
  push("on_time", DEMO_WORKFORCE.onTimeArrivals);
  push("late", DEMO_WORKFORCE.lateArrivals);
  push("remote", DEMO_WORKFORCE.remoteMissions);
  push("planned_leave", DEMO_WORKFORCE.plannedLeave);
  push("unexcused_absence", DEMO_WORKFORCE.unexcusedAbsences);
  const rand = mulberry32(42);
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
  return queue;
}

export function createSeedEmployees(): Employee[] {
  const statusQueue = buildTodayStatusQueue();
  const employees: Employee[] = [];
  let globalIndex = 0;
  const rand = mulberry32(7);

  for (const dept of DEMO_DEPARTMENTS) {
    for (let i = 0; i < dept.headcount; i++) {
      globalIndex++;
      const id = `emp-${String(globalIndex).padStart(4, "0")}`;
      const firstName = FIRST[Math.floor(rand() * FIRST.length)];
      const lastName = LAST[Math.floor(rand() * LAST.length)];
      const todayStatus = statusQueue[globalIndex - 1] ?? "on_time";
      const status =
        todayStatus === "planned_leave"
          ? "on_leave"
          : todayStatus === "unexcused_absence"
            ? "active"
            : "active";

      employees.push({
        id,
        employeeCode: `#EMP-${1000 + globalIndex}`,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@presencia.io`,
        departmentId: dept.id,
        role:
          dept.id === "dept-engineering"
            ? "Software Engineer"
            : dept.id === "dept-product"
              ? "Product Designer"
              : dept.id === "dept-legal"
                ? "Compliance Analyst"
                : dept.id === "dept-operations"
                  ? "Operations Associate"
                  : "Client Specialist",
        status,
        todayStatus,
        hiredAt: `202${Math.floor(rand() * 3)}-${String(1 + Math.floor(rand() * 12)).padStart(2, "0")}-15`,
        phone: `+243 81 ${String(Math.floor(rand() * 9000000) + 1000000)}`,
      });
    }
  }

  return employees;
}

const REFERENCE_DATE = "2023-10-25";

function terminalForDept(deptId: Department["id"]): Terminal {
  const map: Record<Department["id"], string> = {
    "dept-engineering": "term-a1",
    "dept-product": "term-f3",
    "dept-legal": "term-wb",
    "dept-operations": "term-b1",
    "dept-support": "term-remote",
  };
  return DEMO_TERMINALS.find((t) => t.id === map[deptId]) ?? DEMO_TERMINALS[0];
}

export function createSeedAttendance(employees: Employee[]): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const rand = mulberry32(99);

  for (const employee of employees) {
    const terminal = terminalForDept(employee.departmentId);
    const checkpointName =
      DEMO_CHECKPOINTS.find((c) => c.id === terminal.checkpointId)?.name ??
      "Main Gate";

    if (
      employee.todayStatus === "planned_leave" ||
      employee.todayStatus === "unexcused_absence"
    ) {
      records.push({
        id: `att-${employee.id}-${REFERENCE_DATE}`,
        employeeId: employee.id,
        departmentId: employee.departmentId,
        date: REFERENCE_DATE,
        checkIn: null,
        checkOut: null,
        terminalId: null,
        checkpointName,
        verification: "—",
        status: "absent",
        delayMinutes: null,
        notes:
          employee.todayStatus === "planned_leave"
            ? "Approved leave"
            : "Unexcused absence",
      });
      continue;
    }

    const isLate = employee.todayStatus === "late";
    const isRemote = employee.todayStatus === "remote";
    const checkInHour = isLate ? 9 : isRemote ? 8 : 8;
    const checkInMin = isLate
      ? 8 + Math.floor(rand() * 25)
      : 5 + Math.floor(rand() * 25);
    const checkIn = `${String(checkInHour).padStart(2, "0")}:${String(checkInMin).padStart(2, "0")}`;

    records.push({
      id: `att-${employee.id}-${REFERENCE_DATE}`,
      employeeId: employee.id,
      departmentId: employee.departmentId,
      date: REFERENCE_DATE,
      checkIn,
      checkOut: null,
      terminalId: isRemote ? "term-remote" : terminal.id,
      checkpointName: isRemote ? "Remote Mission" : checkpointName,
      verification: isRemote ? "GPS" : rand() > 0.4 ? "GPS + QR" : "QR",
      status: isLate ? "late" : isRemote ? "remote" : "on_time",
      delayMinutes: isLate ? 10 + Math.floor(rand() * 20) : 0,
    });
  }

  const historyEmployees = employees.filter(
    (e) =>
      e.todayStatus === "on_time" ||
      e.todayStatus === "late" ||
      e.todayStatus === "remote"
  );

  for (let d = 1; d <= 14; d++) {
    const date = `2023-10-${String(25 - d).padStart(2, "0")}`;
    for (const employee of historyEmployees.slice(0, 120)) {
      const terminal = terminalForDept(employee.departmentId);
      const late = rand() < 0.05;
      records.push({
        id: `att-hist-${employee.id}-${date}`,
        employeeId: employee.id,
        departmentId: employee.departmentId,
        date,
        checkIn: late ? "09:12" : "08:22",
        checkOut: "17:45",
        terminalId: terminal.id,
        checkpointName:
          DEMO_CHECKPOINTS.find((c) => c.id === terminal.checkpointId)?.name ??
          "Gate",
        verification: "GPS + QR",
        status: late ? "late" : "on_time",
        delayMinutes: late ? 14 : 0,
      });
    }
  }

  return records;
}

export function createSeedQrCodes(): QrCodeRecord[] {
  return DEMO_TERMINALS.flatMap((terminal, ti) => {
    return [1, 2].map((n) => ({
      id: `qr-${terminal.id}-${n}`,
      label: `${terminal.name} — Pass ${n}`,
      token: `PRS-${terminal.id.toUpperCase()}-${n}-A7F2`,
      terminalId: terminal.id,
      checkpointId: terminal.checkpointId,
      status: ti % 3 === 0 ? "rotated" : "active",
      createdAt: "2023-10-01T08:00:00Z",
      rotatedAt: ti % 3 === 0 ? "2023-10-20T08:00:00Z" : undefined,
      scanCount: 800 + ti * 47 + n * 12,
    })) as QrCodeRecord[];
  });
}

export const DEMO_ALERTS: OperationalAlert[] = [
  {
    id: "terminal-b",
    title: "Terminal B Scanner Congestion",
    time: "09:12 AM",
    body:
      "12 late scans between 08:58 - 09:15. Scanner latency detected (+4.2s delay). Scanner QR re-sync suggested.",
    tone: "warning",
  },
  {
    id: "geofence",
    title: "Geofence Anomaly — Building C",
    time: "08:47 AM",
    body:
      "4 check-ins logged near outer geofence boundary (420m of 500m radius limit) in Building C corridor.",
    tone: "danger",
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

export const DEMO_EXPORT_HISTORY: ExportHistoryEntry[] = [
  {
    id: "exp-1",
    category: "Attendance logs",
    format: "csv",
    rangeLabel: "Oct 1 – Oct 24, 2023",
    createdAt: "2023-10-24T16:30:00Z",
    rowCount: 1840,
    fileName: "attendance-oct-2023.csv",
  },
  {
    id: "exp-2",
    category: "Employee directory",
    format: "xlsx",
    rangeLabel: "Full roster",
    createdAt: "2023-10-20T11:00:00Z",
    rowCount: 480,
    fileName: "employees-roster.xlsx",
  },
];

export const DEFAULT_ORGANIZATION: OrganizationSettings = {
  name: "Presencia HQ",
  legalName: "Presencia Workforce Technologies SARL",
  campus: "HQ - Main Campus",
  timezone: "Africa/Kinshasa",
  address: "12 Boulevard du 30 Juin, Kinshasa",
  supportEmail: "support@presencia.io",
};

export const DEFAULT_ATTENDANCE_RULES: AttendanceRulesSettings = {
  workdayStart: "08:00",
  workdayEnd: "17:00",
  lateGraceMinutes: 10,
  geofenceEnforced: true,
  remoteMissionsEnabled: true,
  autoCheckoutEnabled: false,
};

export const DEFAULT_QR_PREFS: QrTerminalPreferences = {
  rotationIntervalMinutes: 15,
  dynamicQrEnabled: true,
  protocolVersion: "v2.4",
  offlineFallbackEnabled: true,
};

export const DEFAULT_APP_PREFS: AppPreferences = {
  locale: "en-US",
  dateFormat: "MMM d, yyyy",
  density: "comfortable",
  demoBanner: true,
};

export const DEFAULT_ADMIN_PROFILE: AdminProfileSettings = {
  name: "Alex Rivers",
  email: "admin@presencia.io",
  role: "Super Administrator",
  phone: "+243 99 000 1122",
  timezone: "Africa/Kinshasa",
};

export const DEMO_REFERENCE_DATE = REFERENCE_DATE;
