import type { ZodError } from "zod";
import { z } from "zod";

import { zodValidationErrorResponse } from "@/lib/api/route";

import {
  attendanceListQuerySchema,
  toApiAttendanceListQueryParams,
  type AttendanceListQuery,
} from "./schemas";

const LIST_QUERY_KEYS = new Set([
  "from",
  "to",
  "month",
  "week",
  "date",
  "user_id",
  "status",
]);

export function searchParamsToAttendanceQueryRaw(
  params: URLSearchParams
): Record<string, string> {
  const raw: Record<string, string> = {};
  for (const key of params.keys()) {
    if (!LIST_QUERY_KEYS.has(key)) {
      throw new AttendanceQueryParseError(
        zodValidationErrorResponse(
          new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              message: "Paramètre de requête inconnu.",
              path: [key],
            },
          ])
        )
      );
    }
    const value = params.get(key);
    if (value !== null && value.trim() !== "") {
      raw[key] = value.trim();
    }
  }
  return raw;
}

export class AttendanceQueryParseError extends Error {
  readonly response: Response;

  constructor(response: Response) {
    super("Invalid attendance list query");
    this.name = "AttendanceQueryParseError";
    this.response = response;
  }
}

export function parseAttendanceListQuery(
  raw: unknown
):
  | { ok: true; data: AttendanceListQuery }
  | { ok: false; error: ZodError } {
  const parsed = attendanceListQuerySchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error };
  }
  return { ok: true, data: parsed.data };
}

export function parseAttendanceListQueryFromSearchParams(
  params: URLSearchParams
): AttendanceListQuery {
  let raw: Record<string, string>;
  try {
    raw = searchParamsToAttendanceQueryRaw(params);
  } catch (error) {
    if (error instanceof AttendanceQueryParseError) {
      throw error;
    }
    throw error;
  }

  const parsed = parseAttendanceListQuery(raw);
  if (!parsed.ok) {
    throw new AttendanceQueryParseError(
      zodValidationErrorResponse(parsed.error)
    );
  }
  return parsed.data;
}

export function buildSuperAdminAttendancesApiPath(
  query: AttendanceListQuery
): string {
  const qs = new URLSearchParams(
    toApiAttendanceListQueryParams(query)
  ).toString();
  return `/super-admin/attendances${qs ? `?${qs}` : ""}`;
}