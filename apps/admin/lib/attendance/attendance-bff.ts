import { bffFetch, BffRequestError } from "@/lib/auth/bff-client";

import type { AttendanceListBffData } from "./parse-list-response";
import {
  toApiAttendanceListQueryParams,
  type AttendanceListQuery,
} from "./schemas";

const BASE = "/api/super-admin/attendances";

export function buildAttendanceListBffUrl(query: AttendanceListQuery): string {
  const qs = new URLSearchParams(
    toApiAttendanceListQueryParams(query)
  ).toString();
  return qs ? `${BASE}?${qs}` : BASE;
}

export async function fetchAttendanceList(
  filters: AttendanceListQuery
): Promise<AttendanceListBffData> {
  const res = await bffFetch<AttendanceListBffData>(
    buildAttendanceListBffUrl(filters),
    { method: "GET" }
  );

  if (!res.data || !Array.isArray(res.data.attendances)) {
    throw new BffRequestError(502, {
      success: false,
      message: "Réponse présences incomplète.",
    });
  }

  return {
    attendances: res.data.attendances,
    period: res.data.period,
  };
}

export function mapBffAttendanceError(err: BffRequestError): string {
  if (err.status === 401) {
    return "Session expirée. Reconnectez-vous.";
  }
  if (err.status === 403) {
    return err.message || "Action non autorisée.";
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
  if (err.status === 429) {
    return "Trop de requêtes. Patientez puis réessayez.";
  }
  if (err.status >= 500) {
    return err.message || "Serveur indisponible. Réessayez plus tard.";
  }
  return err.message;
}