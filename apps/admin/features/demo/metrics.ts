import { DEMO_PRESENT_RATE, DEMO_WORKFORCE } from "./workforce-constants";
import type {
  AttendanceRecord,
  Department,
  Employee,
  WorkforceSnapshot,
} from "@/types/domain";

export function buildWorkforceSnapshot(
  employees?: Employee[]
): WorkforceSnapshot {
  if (!employees?.length) {
    return {
      totalWorkforce: DEMO_WORKFORCE.totalWorkforce,
      onTimeArrivals: DEMO_WORKFORCE.onTimeArrivals,
      lateArrivals: DEMO_WORKFORCE.lateArrivals,
      physicalAttendance: DEMO_WORKFORCE.physicalAttendance,
      remoteMissions: DEMO_WORKFORCE.remoteMissions,
      plannedLeave: DEMO_WORKFORCE.plannedLeave,
      unexcusedAbsences: DEMO_WORKFORCE.unexcusedAbsences,
      absentToday:
        DEMO_WORKFORCE.plannedLeave + DEMO_WORKFORCE.unexcusedAbsences,
      presentRate: Math.round(DEMO_PRESENT_RATE * 10) / 10,
    };
  }

  const onTime = employees.filter((e) => e.todayStatus === "on_time").length;
  const late = employees.filter((e) => e.todayStatus === "late").length;
  const remote = employees.filter((e) => e.todayStatus === "remote").length;
  const leave = employees.filter((e) => e.todayStatus === "planned_leave").length;
  const unexcused = employees.filter(
    (e) => e.todayStatus === "unexcused_absence"
  ).length;
  const physical = onTime + late;
  const total = employees.length;

  return {
    totalWorkforce: total,
    onTimeArrivals: onTime,
    lateArrivals: late,
    physicalAttendance: physical,
    remoteMissions: remote,
    plannedLeave: leave,
    unexcusedAbsences: unexcused,
    absentToday: leave + unexcused,
    presentRate: total ? Math.round((physical / total) * 1000) / 10 : 0,
  };
}

export function departmentAttendanceRates(
  departments: Department[],
  employees: Employee[],
  records: AttendanceRecord[],
  referenceDate: string
): { departmentId: Department["id"]; rate: number; present: number; total: number }[] {
  return departments.map((dept) => {
    const deptEmployees = employees.filter(
      (e) => e.departmentId === dept.id && e.status === "active"
    );
    const dayRecords = records.filter(
      (r) =>
        r.departmentId === dept.id &&
        r.date === referenceDate &&
        (r.status === "on_time" || r.status === "late" || r.status === "remote")
    );
    const present = dayRecords.length;
    const total = deptEmployees.length || dept.headcount;
    const rate = total ? Math.round((present / total) * 1000) / 10 : 0;
    return { departmentId: dept.id, rate, present, total };
  });
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pages,
    total,
    from: total ? start + 1 : 0,
    to: Math.min(start + pageSize, total),
  };
}

export function sortBy<T>(
  items: T[],
  accessor: (item: T) => string | number,
  direction: "asc" | "desc"
): T[] {
  return [...items].sort((a, b) => {
    const av = accessor(a);
    const bv = accessor(b);
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return direction === "asc" ? cmp : -cmp;
  });
}
