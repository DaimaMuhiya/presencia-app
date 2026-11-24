import type { AttendanceStatusDisplay } from "./attendance-status";

export type ApiAttendancePublic = {
  id: string;
  user_id: string;
  schedules_id: string | null;
  attendance_date: string;
  arrival_at: string | null;
  departure_at: string | null;
  status: string;
};

export type ApiAttendancePeriod = {
  from: string | null;
  to: string | null;
};

export type ApiAttendanceListData = {
  attendances: ApiAttendancePublic[];
  period?: ApiAttendancePeriod;
};

export type AdminAttendance = {
  id: string;
  userId: string;
  scheduleId: string | null;
  attendanceDate: string;
  arrivalAt: string | null;
  departureAt: string | null;
  status: AttendanceStatusDisplay;
  statusRaw?: string;
};