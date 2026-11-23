import type { ApiUserPublic } from "@/types/api/user";

import { parseEmploymentStatus } from "./employment-status";
import type { AdminEmployee, EmployeeRole } from "./types";

const ROLES = new Set<EmployeeRole>(["super_admin", "admin", "employee"]);

function parseRole(raw: string | undefined): EmployeeRole {
  if (raw && ROLES.has(raw as EmployeeRole)) {
    return raw as EmployeeRole;
  }
  return "employee";
}

function formatEmployeeCode(code: string | null | undefined): string {
  if (!code?.trim()) {
    return "—";
  }
  return code.trim();
}

export function mapApiUserToAdminEmployee(user: ApiUserPublic): AdminEmployee {
  const firstName =
    user.firstName ?? user.first_name ?? user.name?.split(" ")[0] ?? "";
  const lastName =
    user.lastName ??
    user.last_name ??
    user.name?.split(" ").slice(1).join(" ") ??
    "";
  const email = user.work_email ?? user.email ?? "";
  const code = user.employee_code ?? user.employeeId ?? "";
  const statusRaw = user.employment_status ?? user.workStatus;
  const parsedStatus = parseEmploymentStatus(statusRaw);

  return {
    id: user.id,
    firstName,
    lastName,
    email,
    employeeCode: formatEmployeeCode(code),
    role: parseRole(user.role),
    employmentStatus: parsedStatus.status,
    employmentStatusRaw: parsedStatus.raw,
    jobTitle: user.job_title ?? user.position ?? null,
    phone: user.phone ?? null,
    joiningDate: user.joining_date ?? user.joiningDate ?? null,
    avatarUrl: user.avatar_url ?? user.avatar ?? null,
  };
}

export function mapApiUsersToAdminEmployees(
  users: ApiUserPublic[]
): AdminEmployee[] {
  return users.map(mapApiUserToAdminEmployee);
}