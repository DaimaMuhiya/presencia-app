import type { AttendanceStatusDisplay } from "./attendance-status";
import type { AttendanceListQuery } from "./schemas";
import type { AdminAttendance } from "./types";

export const ATTENDANCE_PAGE_SIZE = 15;

export type AttendanceStatusFilter = "all" | AttendanceStatusDisplay;

export function toIsoDateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function defaultAttendancePeriod(
  now: Date = new Date()
): { from: string; to: string } {
  const to = toIsoDateLocal(now);
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return { from: toIsoDateLocal(start), to };
}

export function validateAttendancePeriod(
  from: string,
  to: string
): string | null {
  if (!from || !to) {
    return "Les dates de début et de fin sont obligatoires.";
  }
  if (from > to) {
    return "La date de début doit être antérieure ou égale à la date de fin.";
  }
  return null;
}

export function buildAttendanceListQuery(
  from: string,
  to: string,
  status: AttendanceStatusFilter,
  userId: string | "all" = "all"
): AttendanceListQuery | null {
  if (validateAttendancePeriod(from, to)) {
    return null;
  }

  const base: AttendanceListQuery =
    status === "all" || status === "unknown"
      ? { from, to }
      : { from, to, status };

  if (userId !== "all" && userId.trim() !== "") {
    return { ...base, user_id: userId };
  }

  return base;
}

export function filterAttendancesBySearch(
  rows: AdminAttendance[],
  search: string
): AdminAttendance[] {
  const q = search.trim().toLowerCase();
  if (!q) {
    return rows;
  }
  return rows.filter(
    (row) =>
      row.userId.toLowerCase().includes(q) || row.id.toLowerCase().includes(q)
  );
}

export function sortAttendancesByDate(
  rows: AdminAttendance[]
): AdminAttendance[] {
  return [...rows].sort((a, b) => {
    const aKey = `${a.attendanceDate}\t${a.arrivalAt ?? ""}`;
    const bKey = `${b.attendanceDate}\t${b.arrivalAt ?? ""}`;
    return bKey.localeCompare(aKey);
  });
}

export function paginateList<T>(
  items: T[],
  page: number,
  pageSize: number
): {
  items: T[];
  page: number;
  pages: number;
  total: number;
  from: number;
  to: number;
} {
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pages,
    total,
    from: total ? start + 1 : 0,
    to: Math.min(start + pageSize, total),
  };
}

export function attendanceStatusBadgeTone(
  status: AttendanceStatusDisplay
): "green" | "amber" | "rose" | "blue" | "neutral" {
  switch (status) {
    case "on_time":
      return "green";
    case "late":
      return "amber";
    case "absent":
      return "rose";
    case "exception":
      return "blue";
    default:
      return "amber";
  }
}

export type AttendanceEmptyStateKind = "search" | "filters" | null;

export function resolveAttendanceEmptyState(
  loadedCount: number,
  displayedCount: number,
  search: string
): AttendanceEmptyStateKind {
  if (displayedCount > 0) {
    return null;
  }
  if (loadedCount === 0) {
    return "filters";
  }
  if (search.trim()) {
    return "search";
  }
  return "filters";
}