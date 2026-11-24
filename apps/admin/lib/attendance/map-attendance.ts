import type { z } from "zod";

import { parseAttendanceStatus } from "./attendance-status";
import { apiAttendanceSchema, type ApiAttendanceParsed } from "./schemas";
import type { AdminAttendance, ApiAttendancePublic } from "./types";

export function mapApiAttendanceToAdminAttendance(
  input: ApiAttendanceParsed
): AdminAttendance {
  const statusParsed = parseAttendanceStatus(input.status);

  return {
    id: input.id,
    userId: input.user_id,
    scheduleId: input.schedules_id,
    attendanceDate: input.attendance_date,
    arrivalAt: input.arrival_at,
    departureAt: input.departure_at,
    status: statusParsed.status,
    statusRaw: statusParsed.raw,
  };
}

export function mapApiAttendanceFromUnknown(raw: unknown): AdminAttendance {
  const parsed = apiAttendanceSchema.parse(raw);
  return mapApiAttendanceToAdminAttendance(parsed);
}

export function safeMapApiAttendance(
  raw: unknown
): { ok: true; data: AdminAttendance } | { ok: false; error: z.ZodError } {
  const parsed = apiAttendanceSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error };
  }
  return {
    ok: true,
    data: mapApiAttendanceToAdminAttendance(parsed.data),
  };
}

export function mapApiAttendancesToAdminAttendances(
  rows: ApiAttendancePublic[]
): AdminAttendance[] {
  return rows.map((row) =>
    mapApiAttendanceToAdminAttendance(apiAttendanceSchema.parse(row))
  );
}