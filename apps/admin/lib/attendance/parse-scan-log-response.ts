import { z, type ZodError } from "zod";

import { mapApiScanLogs } from "./map-scan-log";
import { apiScanLogSchema } from "./scan-log-schemas";
import type { AdminScanLog } from "./scan-log-types";

export const apiScanLogListDataSchema = z.object({
  scan_logs: z.array(apiScanLogSchema),
});

export class ScanLogListDataError extends Error {
  readonly cause: ZodError;

  constructor(error: ZodError) {
    super("Réponse scan logs invalide.");
    this.name = "ScanLogListDataError";
    this.cause = error;
  }
}

export function normalizeScanLogListData(data: unknown): AdminScanLog[] {
  const parsed = apiScanLogListDataSchema.safeParse(data);
  if (!parsed.success) {
    throw new ScanLogListDataError(parsed.error);
  }
  return mapApiScanLogs(parsed.data.scan_logs);
}