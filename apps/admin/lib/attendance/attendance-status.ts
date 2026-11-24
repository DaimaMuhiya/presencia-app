export type AttendanceStatus = "on_time" | "late" | "absent" | "exception";

export type AttendanceStatusDisplay = AttendanceStatus | "unknown";

const KNOWN = new Set<AttendanceStatus>([
  "on_time",
  "late",
  "absent",
  "exception",
]);

export function parseAttendanceStatus(raw: string | undefined): {
  status: AttendanceStatusDisplay;
  raw?: string;
} {
  if (raw && KNOWN.has(raw as AttendanceStatus)) {
    return { status: raw as AttendanceStatus };
  }
  if (raw) {
    return { status: "unknown", raw };
  }
  return { status: "unknown" };
}

export function formatAttendanceStatusLabel(
  status: AttendanceStatusDisplay,
  raw?: string
): string {
  if (status === "unknown") {
    return raw ? `Statut inconnu (${raw})` : "Statut inconnu";
  }
  const map: Record<AttendanceStatus, string> = {
    on_time: "À l'heure",
    late: "En retard",
    absent: "Absent",
    exception: "Exception",
  };
  return map[status];
}

export function isKnownAttendanceStatus(
  status: AttendanceStatusDisplay
): status is AttendanceStatus {
  return status !== "unknown";
}