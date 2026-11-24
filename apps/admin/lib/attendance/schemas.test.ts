import { describe, expect, it } from "vitest";

import {
  apiAttendanceSchema,
  attendanceListQuerySchema,
  toApiAttendanceListQueryParams,
} from "./schemas";

const UUID = "11111111-2222-4333-8444-555555555555";

describe("apiAttendanceSchema", () => {
  const valid = {
    id: UUID,
    user_id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    schedules_id: UUID,
    attendance_date: "2026-11-12",
    arrival_at: "2026-11-12T08:15:00Z",
    departure_at: "2026-11-12T17:00:00Z",
    status: "on_time",
  };

  it("accepte une présence complète", () => {
    expect(apiAttendanceSchema.safeParse(valid).success).toBe(true);
  });

  it("accepte arrival_at, departure_at et schedules_id nuls", () => {
    const parsed = apiAttendanceSchema.safeParse({
      ...valid,
      schedules_id: null,
      arrival_at: null,
      departure_at: null,
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.schedules_id).toBeNull();
      expect(parsed.data.arrival_at).toBeNull();
      expect(parsed.data.departure_at).toBeNull();
    }
  });

  it("rejette une date métier invalide", () => {
    expect(
      apiAttendanceSchema.safeParse({
        ...valid,
        attendance_date: "12-11-2026",
      }).success
    ).toBe(false);
  });

  it("rejette un horodatage invalide", () => {
    expect(
      apiAttendanceSchema.safeParse({
        ...valid,
        arrival_at: "pas-une-date",
      }).success
    ).toBe(false);
  });

  it("rejette les champs obligatoires absents", () => {
    expect(
      apiAttendanceSchema.safeParse({
        user_id: valid.user_id,
        schedules_id: valid.schedules_id,
        attendance_date: valid.attendance_date,
        arrival_at: valid.arrival_at,
        departure_at: valid.departure_at,
        status: valid.status,
      }).success
    ).toBe(false);
    expect(
      apiAttendanceSchema.safeParse({ ...valid, user_id: "bad" }).success
    ).toBe(false);
  });
});

describe("attendanceListQuerySchema", () => {
  it("rejette from sans to ou période manquante", () => {
    expect(
      attendanceListQuerySchema.safeParse({ from: "2026-11-01" }).success
    ).toBe(false);
    expect(attendanceListQuerySchema.safeParse({}).success).toBe(false);
  });

  it("valide les filtres de période et employé", () => {
    expect(
      attendanceListQuerySchema.safeParse({
        from: "2026-11-01",
        to: "2026-11-30",
        user_id: UUID,
        status: "late",
      }).success
    ).toBe(true);
  });

  it("valide month et week", () => {
    expect(
      attendanceListQuerySchema.safeParse({ month: "2026-11" }).success
    ).toBe(true);
    expect(
      attendanceListQuerySchema.safeParse({ week: "2026-W46" }).success
    ).toBe(true);
    expect(
      attendanceListQuerySchema.safeParse({ date: "2026-11-12" }).success
    ).toBe(true);
  });

  it("rejette un statut hors contrat", () => {
    expect(
      attendanceListQuerySchema.safeParse({ status: "remote" }).success
    ).toBe(false);
  });

  it("rejette un mois invalide", () => {
    expect(
      attendanceListQuerySchema.safeParse({ month: "2026-13" }).success
    ).toBe(false);
  });

  it("rejette les clés inconnues", () => {
    expect(
      attendanceListQuerySchema.safeParse({
        from: "2026-11-01",
        department_id: "dept-1",
      }).success
    ).toBe(false);
  });
});

describe("toApiAttendanceListQueryParams", () => {
  it("ne mappe que les valeurs définies", () => {
    expect(
      toApiAttendanceListQueryParams({
        from: "2026-11-01",
        to: "2026-11-07",
        status: "on_time",
      })
    ).toEqual({
      from: "2026-11-01",
      to: "2026-11-07",
      status: "on_time",
    });
  });
});