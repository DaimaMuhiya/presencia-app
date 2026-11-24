import { z, type ZodError } from "zod";

import { mapApiAttendanceToAdminAttendance } from "./map-attendance";
import { apiAttendanceSchema } from "./schemas";
import type { AdminAttendance, ApiAttendancePeriod } from "./types";

export const apiAttendanceListDataSchema = z.object({
  attendances: z.array(apiAttendanceSchema),
  period: z
    .object({
      from: z.union([z.string(), z.null()]),
      to: z.union([z.string(), z.null()]),
    })
    .optional(),
});

export type AttendanceListBffData = {
  attendances: AdminAttendance[];
  period?: ApiAttendancePeriod;
};

export class AttendanceListDataError extends Error {
  readonly cause: ZodError;

  constructor(error: ZodError) {
    super("Réponse présences invalide.");
    this.name = "AttendanceListDataError";
    this.cause = error;
  }
}

export function normalizeAttendanceListData(
  data: unknown
): AttendanceListBffData {
  const parsed = apiAttendanceListDataSchema.safeParse(data);
  if (!parsed.success) {
    throw new AttendanceListDataError(parsed.error);
  }

  return {
    attendances: parsed.data.attendances.map((row) =>
      mapApiAttendanceToAdminAttendance(row)
    ),
    period: parsed.data.period,
  };
}