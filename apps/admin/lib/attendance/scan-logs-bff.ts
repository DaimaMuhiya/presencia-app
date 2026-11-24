import { bffFetch, BffRequestError } from "@/lib/auth/bff-client";

import type { AdminScanLog } from "./scan-log-types";
import { toApiScanLogListQueryParams, type ScanLogListQuery } from "./scan-log-schemas";

const BASE = "/api/super-admin/scan-logs";

type ScanLogListBffData = {
  scan_logs: AdminScanLog[];
};

export function buildScanLogsBffUrl(query: ScanLogListQuery): string {
  const qs = new URLSearchParams(toApiScanLogListQueryParams(query)).toString();
  return `${BASE}?${qs}`;
}

export async function fetchScanLogs(
  query: ScanLogListQuery
): Promise<AdminScanLog[]> {
  const res = await bffFetch<ScanLogListBffData>(buildScanLogsBffUrl(query), {
    method: "GET",
  });

  if (!res.data || !Array.isArray(res.data.scan_logs)) {
    throw new BffRequestError(502, {
      success: false,
      message: "Réponse scan logs incomplète.",
    });
  }

  return res.data.scan_logs;
}

export async function fetchScanLogsForAttendanceDay(
  userId: string,
  attendanceDate: string
): Promise<AdminScanLog[]> {
  return fetchScanLogs({ date: attendanceDate, user_id: userId });
}

export function mapBffScanLogError(err: BffRequestError): string {
  if (err.status === 401) {
    return "Session expirée. Reconnectez-vous.";
  }
  if (err.status === 403) {
    return err.message || "Action non autorisée.";
  }
  if (err.status === 429) {
    return "Trop de requêtes. Patientez puis réessayez.";
  }
  if (err.status === 422) {
    const fieldMessages = err.body.errors
      ? Object.values(err.body.errors)
          .flat()
          .filter(Boolean)
          .join(" ")
      : "";
    return fieldMessages || err.message;
  }
  if (err.status >= 500) {
    return err.message || "Serveur indisponible.";
  }
  return err.message;
}