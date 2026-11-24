import { z } from "zod";

import { zodValidationErrorResponse } from "@/lib/api/route";

import {
  scanLogListQuerySchema,
  toApiScanLogListQueryParams,
  type ScanLogListQuery,
} from "./scan-log-schemas";

const SCAN_LOG_QUERY_KEYS = new Set(["date", "user_id", "is_success"]);

export class ScanLogQueryParseError extends Error {
  readonly response: Response;

  constructor(response: Response) {
    super("Invalid scan log list query");
    this.name = "ScanLogQueryParseError";
    this.response = response;
  }
}

export function parseScanLogListQueryFromSearchParams(
  params: URLSearchParams
): ScanLogListQuery {
  const raw: Record<string, string> = {};
  for (const key of params.keys()) {
    if (!SCAN_LOG_QUERY_KEYS.has(key)) {
      throw new ScanLogQueryParseError(
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

  const parsed = scanLogListQuerySchema.safeParse(raw);
  if (!parsed.success) {
    throw new ScanLogQueryParseError(
      zodValidationErrorResponse(parsed.error)
    );
  }

  return parsed.data;
}

export function buildSuperAdminScanLogsApiPath(query: ScanLogListQuery): string {
  const qs = new URLSearchParams(toApiScanLogListQueryParams(query)).toString();
  return `/super-admin/scan-logs?${qs}`;
}