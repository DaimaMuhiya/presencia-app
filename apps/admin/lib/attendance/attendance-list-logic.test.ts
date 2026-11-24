import { describe, expect, it } from "vitest";

import type { AdminAttendance } from "./types";

import {
  ATTENDANCE_PAGE_SIZE,
  attendanceStatusBadgeTone,
  resolveAttendanceEmptyState,
  buildAttendanceListQuery,
  defaultAttendancePeriod,
  filterAttendancesBySearch,
  paginateList,
  sortAttendancesByDate,
  validateAttendancePeriod,
} from "./attendance-list-logic";

function row(partial: Partial<AdminAttendance> & Pick<AdminAttendance, "id">): AdminAttendance {
  return {
    id: partial.id,
    userId: partial.userId ?? "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    scheduleId: null,
    attendanceDate: partial.attendanceDate ?? "2026-11-12",
    arrivalAt: partial.arrivalAt ?? null,
    departureAt: partial.departureAt ?? null,
    status: partial.status ?? "on_time",
    statusRaw: partial.statusRaw,
  };
}

describe("defaultAttendancePeriod", () => {
  it("utilise le 1er jour du mois courant et aujourd'hui", () => {
    const period = defaultAttendancePeriod(new Date(2026, 10, 24));
    expect(period).toEqual({ from: "2026-11-01", to: "2026-11-24" });
  });
});

describe("buildAttendanceListQuery", () => {
  it("construit une plage valide sans statut", () => {
    expect(buildAttendanceListQuery("2026-11-01", "2026-11-07", "all")).toEqual({
      from: "2026-11-01",
      to: "2026-11-07",
    });
  });

  it("ajoute user_id sans requête individuelle", () => {
    expect(
      buildAttendanceListQuery(
        "2026-11-01",
        "2026-11-07",
        "all",
        "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
      )
    ).toEqual({
      from: "2026-11-01",
      to: "2026-11-07",
      user_id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    });
  });

  it("ajoute le filtre statut API", () => {
    expect(
      buildAttendanceListQuery("2026-11-01", "2026-11-07", "late")
    ).toEqual({
      from: "2026-11-01",
      to: "2026-11-07",
      status: "late",
    });
  });

  it("ne transmet pas unknown à l'API", () => {
    expect(
      buildAttendanceListQuery("2026-11-01", "2026-11-07", "unknown")
    ).toEqual({
      from: "2026-11-01",
      to: "2026-11-07",
    });
  });

  it("retourne null si période invalide", () => {
    expect(buildAttendanceListQuery("2026-11-30", "2026-11-01", "all")).toBeNull();
    expect(validateAttendancePeriod("", "2026-11-01")).not.toBeNull();
  });
});

describe("filterAttendancesBySearch", () => {
  const rows = [
    row({ id: "11111111-2222-4333-8444-555555555501", userId: "aaaa-bbbb" }),
    row({ id: "11111111-2222-4333-8444-555555555502", userId: "cccc-dddd" }),
  ];

  it("filtre sur userId ou id de présence", () => {
    expect(filterAttendancesBySearch(rows, "aaaa")).toHaveLength(1);
    expect(filterAttendancesBySearch(rows, "5502")).toHaveLength(1);
    expect(filterAttendancesBySearch(rows, "")).toHaveLength(2);
  });
});

describe("pagination client", () => {
  it("paginate à 15 lignes et réinitialise les bornes", () => {
    const items = Array.from({ length: 20 }, (_, i) =>
      row({ id: `11111111-2222-4333-8444-5555555555${String(i).padStart(2, "0")}` })
    );
    const page1 = paginateList(items, 1, ATTENDANCE_PAGE_SIZE);
    expect(page1.items).toHaveLength(15);
    expect(page1.total).toBe(20);
    const page2 = paginateList(items, 2, ATTENDANCE_PAGE_SIZE);
    expect(page2.items).toHaveLength(5);
    expect(page2.from).toBe(16);
  });

  it("expose un ton distinct pour statut inconnu", () => {
    expect(attendanceStatusBadgeTone("unknown")).toBe("amber");
    expect(attendanceStatusBadgeTone("exception")).toBe("blue");
  });

  it("distingue liste vide API et recherche sans résultat", () => {
    expect(resolveAttendanceEmptyState(0, 0, "")).toBe("filters");
    expect(resolveAttendanceEmptyState(5, 0, "zzz")).toBe("search");
    expect(resolveAttendanceEmptyState(5, 2, "x")).toBe(null);
  });

  it("combine période statut et employé dans la query", () => {
    expect(
      buildAttendanceListQuery("2026-11-01", "2026-11-07", "absent", "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee")
    ).toEqual({
      from: "2026-11-01",
      to: "2026-11-07",
      status: "absent",
      user_id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    });
  });

  it("tri par date décroissante", () => {
    const sorted = sortAttendancesByDate([
      row({ id: "a", attendanceDate: "2026-11-10" }),
      row({ id: "b", attendanceDate: "2026-11-12" }),
    ]);
    expect(sorted[0]?.id).toBe("b");
  });
});