import type { AdminScanLog } from "./scan-log-types";
import { apiScanLogSchema, type ApiScanLogParsed } from "./scan-log-schemas";

export function mapApiScanLogToAdminScanLog(input: ApiScanLogParsed): AdminScanLog {
  return {
    id: input.id,
    attendanceId: input.attendance_id,
    userId: input.user_id,
    qrTokenId: input.qr_token_id,
    method: input.method,
    scannedAt: input.scanned_at,
    isSuccess: input.is_success,
    failureReason: input.failure_reason,
  };
}

export function mapApiScanLogs(rows: unknown[]): AdminScanLog[] {
  return rows.map((row) =>
    mapApiScanLogToAdminScanLog(apiScanLogSchema.parse(row))
  );
}