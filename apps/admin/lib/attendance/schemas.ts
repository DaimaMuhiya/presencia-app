import { z } from "zod";

import { uuidParamSchema } from "@/lib/employees/schemas";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_MONTH = /^\d{4}-\d{2}$/;
const ISO_WEEK = /^\d{4}-W\d{1,2}$/i;

const attendanceStatusSchema = z.enum([
  "on_time",
  "late",
  "absent",
  "exception",
]);

function isParseableIsoDateTime(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

const nullableIsoDateTimeSchema = z
  .union([
    z.null(),
    z
      .string()
      .trim()
      .min(1, "Horodatage vide.")
      .refine(isParseableIsoDateTime, "Horodatage ISO invalide."),
  ])
  .transform((v) => (v === null ? null : v));

export const apiAttendanceSchema = z.object({
  id: uuidParamSchema,
  user_id: uuidParamSchema,
  schedules_id: z
    .union([uuidParamSchema, z.null()])
    .optional()
    .transform((v) => v ?? null),
  attendance_date: z
    .string()
    .trim()
    .regex(ISO_DATE, "La date de présence doit être au format AAAA-MM-JJ."),
  arrival_at: nullableIsoDateTimeSchema.optional().transform((v) => v ?? null),
  departure_at: nullableIsoDateTimeSchema
    .optional()
    .transform((v) => v ?? null),
  status: z.string().trim().min(1, "Le statut est obligatoire."),
});

export type ApiAttendanceParsed = z.infer<typeof apiAttendanceSchema>;

const attendanceListQueryShape = z
  .object({
    from: z
      .string()
      .trim()
      .regex(ISO_DATE, "from doit être au format AAAA-MM-JJ.")
      .optional(),
    to: z
      .string()
      .trim()
      .regex(ISO_DATE, "to doit être au format AAAA-MM-JJ.")
      .optional(),
    month: z
      .string()
      .trim()
      .regex(ISO_MONTH, "month doit être au format AAAA-MM.")
      .refine((m) => {
        const monthNum = Number(m.slice(5, 7));
        return monthNum >= 1 && monthNum <= 12;
      }, "Mois invalide.")
      .optional(),
    week: z
      .string()
      .trim()
      .regex(ISO_WEEK, "week doit être au format AAAA-Www.")
      .optional(),
    date: z
      .string()
      .trim()
      .regex(ISO_DATE, "date doit être au format AAAA-MM-JJ.")
      .optional(),
    user_id: uuidParamSchema.optional(),
    status: attendanceStatusSchema.optional(),
  })
  .strict();

export const attendanceListQuerySchema = attendanceListQueryShape.superRefine(
  (data, ctx) => {
    const hasFrom = Boolean(data.from);
    const hasTo = Boolean(data.to);
    const hasMonth = Boolean(data.month);
    const hasWeek = Boolean(data.week);
    const hasDate = Boolean(data.date);

    const rangeMode = hasFrom || hasTo;
    const unitaryModes = [hasMonth, hasWeek, hasDate].filter(Boolean).length;

    if (!rangeMode && unitaryModes === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Une période est obligatoire (from/to, month, week ou date).",
        path: ["from"],
      });
      return;
    }

    if (hasFrom !== hasTo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "from et to doivent être fournis ensemble.",
        path: hasFrom ? ["to"] : ["from"],
      });
    }

    if (hasFrom && hasTo && data.from! > data.to!) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "from doit être antérieur ou égal à to.",
        path: ["from"],
      });
    }

    const activeModes =
      (hasFrom && hasTo ? 1 : 0) + (hasMonth ? 1 : 0) + (hasWeek ? 1 : 0) + (hasDate ? 1 : 0);

    if (activeModes > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Les périodes from/to, month, week et date sont mutuellement exclusives.",
        path: ["from"],
      });
    }
  }
);

export type AttendanceListQuery = z.infer<typeof attendanceListQuerySchema>;

export function toApiAttendanceListQueryParams(
  query: AttendanceListQuery
): Record<string, string> {
  const params: Record<string, string> = {};
  if (query.from) {
    params.from = query.from;
  }
  if (query.to) {
    params.to = query.to;
  }
  if (query.month) {
    params.month = query.month;
  }
  if (query.week) {
    params.week = query.week;
  }
  if (query.date) {
    params.date = query.date;
  }
  if (query.user_id) {
    params.user_id = query.user_id;
  }
  if (query.status) {
    params.status = query.status;
  }
  return params;
}