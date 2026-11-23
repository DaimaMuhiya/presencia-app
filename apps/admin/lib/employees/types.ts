import type { ApiUserPublic } from "@/types/api/user";

export type EmploymentStatus = "active" | "inactive" | "suspended";

export type EmploymentStatusDisplay = EmploymentStatus | "unknown";

export type EmployeeRole = "super_admin" | "admin" | "employee";

export type AdminEmployee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeCode: string;
  role: EmployeeRole;
  employmentStatus: EmploymentStatusDisplay;
  employmentStatusRaw?: string;
  jobTitle: string | null;
  phone: string | null;
  joiningDate: string | null;
  avatarUrl: string | null;
};

export type ApiUserListData = {
  users: ApiUserPublic[];
};

export type ApiUserItemData = {
  user: ApiUserPublic;
};