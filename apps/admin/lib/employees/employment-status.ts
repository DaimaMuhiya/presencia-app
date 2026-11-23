import type { EmploymentStatus } from "./types";

export type EmploymentStatusDisplay = EmploymentStatus | "unknown";

const KNOWN = new Set<EmploymentStatus>(["active", "inactive", "suspended"]);

export function parseEmploymentStatus(raw: string | undefined): {
  status: EmploymentStatusDisplay;
  raw?: string;
} {
  if (raw && KNOWN.has(raw as EmploymentStatus)) {
    return { status: raw as EmploymentStatus };
  }
  if (raw) {
    return { status: "unknown", raw };
  }
  return { status: "unknown" };
}

export function formatEmploymentStatusLabel(
  status: EmploymentStatusDisplay,
  raw?: string
): string {
  if (status === "unknown") {
    return raw ? `Unknown (${raw})` : "Unknown status";
  }
  const map: Record<EmploymentStatus, string> = {
    active: "Active",
    inactive: "Inactive",
    suspended: "Suspended",
  };
  return map[status];
}

export function isKnownEmploymentStatus(
  status: EmploymentStatusDisplay
): status is EmploymentStatus {
  return status !== "unknown";
}