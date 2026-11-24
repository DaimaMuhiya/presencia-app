import type { AdminEmployee } from "@/lib/employees/types";

import type { AdminAttendance } from "./types";

export type EnrichedAttendance = {
  attendance: AdminAttendance;
  employee: AdminEmployee | null;
};

export function indexEmployeesById(
  employees: AdminEmployee[]
): Map<string, AdminEmployee> {
  return new Map(employees.map((employee) => [employee.id, employee]));
}

export function enrichAttendances(
  rows: AdminAttendance[],
  employeesById: Map<string, AdminEmployee>
): EnrichedAttendance[] {
  return rows.map((attendance) => ({
    attendance,
    employee: employeesById.get(attendance.userId) ?? null,
  }));
}

export function employeeDisplayName(employee: AdminEmployee | null): string {
  if (!employee) {
    return "Employé introuvable";
  }
  const name = `${employee.firstName} ${employee.lastName}`.trim();
  return name || "Employé introuvable";
}

export function employeeDisplayCode(
  employee: AdminEmployee | null,
  userId: string
): string {
  if (!employee) {
    return userId;
  }
  const code = employee.employeeCode?.trim();
  if (code && code !== "—") {
    return code;
  }
  return userId;
}

export function employeeJobTitle(employee: AdminEmployee | null): string | null {
  if (!employee) {
    return null;
  }
  const title = employee.jobTitle?.trim();
  return title ? title : null;
}

export function filterEnrichedAttendances(
  rows: EnrichedAttendance[],
  search: string
): EnrichedAttendance[] {
  const q = search.trim().toLowerCase();
  if (!q) {
    return rows;
  }

  return rows.filter(({ attendance, employee }) => {
    if (attendance.id.toLowerCase().includes(q)) {
      return true;
    }
    if (attendance.userId.toLowerCase().includes(q)) {
      return true;
    }
    if (!employee) {
      return false;
    }
    const fullName = `${employee.firstName} ${employee.lastName}`
      .trim()
      .toLowerCase();
    const code = employee.employeeCode.toLowerCase();
    return (
      employee.firstName.toLowerCase().includes(q) ||
      employee.lastName.toLowerCase().includes(q) ||
      fullName.includes(q) ||
      (code !== "—" && code.includes(q))
    );
  });
}

export function sortEnrichedAttendances(
  rows: EnrichedAttendance[]
): EnrichedAttendance[] {
  return [...rows].sort((a, b) => {
    const aKey = `${a.attendance.attendanceDate}\t${a.attendance.arrivalAt ?? ""}`;
    const bKey = `${b.attendance.attendanceDate}\t${b.attendance.arrivalAt ?? ""}`;
    return bKey.localeCompare(aKey);
  });
}