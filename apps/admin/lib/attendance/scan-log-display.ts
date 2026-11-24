import type { AdminScanLog } from "./scan-log-types";

import { formatAttendanceDateTime } from "./attendance-display";

const METHOD_LABELS: Record<string, string> = {
  qr_scan: "Scan QR",
  manual_code: "Code manuel",
  biometric: "Biométrie",
  admin_entry: "Saisie admin",
};

export function formatScanLogMethod(method: string): string {
  return METHOD_LABELS[method] ?? method;
}

export function formatScanLogOutcome(log: AdminScanLog): string {
  return log.isSuccess ? "Réussi" : "Échoué";
}

export function formatScanLogScannedAt(log: AdminScanLog): string {
  return formatAttendanceDateTime(log.scannedAt);
}

export function formatScanLogFailureReason(reason: string | null): string {
  if (!reason?.trim()) {
    return "—";
  }
  return reason.trim();
}