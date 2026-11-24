import type { AdminScanLog, ClassifiedScanLogs } from "./scan-log-types";

export function classifyScanLogsForAttendance(
  logs: AdminScanLog[],
  attendanceId: string
): ClassifiedScanLogs {
  const linked: AdminScanLog[] = [];
  const sameDayOther: AdminScanLog[] = [];

  for (const log of logs) {
    if (log.attendanceId === attendanceId) {
      linked.push(log);
    } else {
      sameDayOther.push(log);
    }
  }

  const byScannedAtDesc = (a: AdminScanLog, b: AdminScanLog) =>
    b.scannedAt.localeCompare(a.scannedAt);

  linked.sort(byScannedAtDesc);
  sameDayOther.sort(byScannedAtDesc);

  return { linked, sameDayOther };
}