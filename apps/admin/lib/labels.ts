import type {
  AttendanceLogStatus,
  Department,
  EmployeeStatus,
  TodayAttendanceStatus,
} from "@/types/domain";

export function departmentName(
  departments: Department[],
  id: Department["id"]
): string {
  return departments.find((d) => d.id === id)?.name ?? id;
}

export function todayStatusLabel(status: TodayAttendanceStatus): string {
  const map: Record<TodayAttendanceStatus, string> = {
    on_time: "On-Time",
    late: "Late",
    remote: "Remote",
    planned_leave: "Planned Leave",
    unexcused_absence: "Unexcused",
  };
  return map[status];
}

export function attendanceLogLabel(status: AttendanceLogStatus): string {
  const map: Record<AttendanceLogStatus, string> = {
    on_time: "On-Time",
    late: "Late",
    early_leave: "Early Leave",
    absent: "Absent",
    remote: "Remote",
  };
  return map[status];
}

export function employeeStatusLabel(status: EmployeeStatus): string {
  const map: Record<EmployeeStatus, string> = {
    active: "Active",
    on_leave: "On Leave",
    inactive: "Inactive",
  };
  return map[status];
}
