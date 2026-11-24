import { describe, expect, it } from "vitest";

import type { ApiAttendancePublic } from "./types";

import {
  mapApiAttendanceFromUnknown,
  mapApiAttendanceToAdminAttendance,
  mapApiAttendancesToAdminAttendances,
  safeMapApiAttendance,
} from "./map-attendance";
import { apiAttendanceSchema } from "./schemas";

const UUID_A = "11111111-2222-4333-8444-555555555555";
const UUID_B = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

const sample: ApiAttendancePublic = {
  id: UUID_A,
  user_id: UUID_B,
  schedules_id: UUID_A,
  attendance_date: "2026-11-12",
  arrival_at: "2026-11-12T08:22:00+00:00",
  departure_at: "2026-11-12T17:45:00Z",
  status: "late",
};

describe("mapApiAttendanceToAdminAttendance", () => {
  it("mappe les champs API vers le modèle admin", () => {
    const parsed = apiAttendanceSchema.parse(sample);
    const row = mapApiAttendanceToAdminAttendance(parsed);
    expect(row.id).toBe(UUID_A);
    expect(row.userId).toBe(UUID_B);
    expect(row.scheduleId).toBe(UUID_A);
    expect(row.attendanceDate).toBe("2026-11-12");
    expect(row.arrivalAt).toBe("2026-11-12T08:22:00+00:00");
    expect(row.departureAt).toBe("2026-11-12T17:45:00Z");
    expect(row.status).toBe("late");
  });

  it("préserve les horodatages nuls", () => {
    const parsed = apiAttendanceSchema.parse({
      ...sample,
      schedules_id: null,
      arrival_at: null,
      departure_at: null,
      status: "absent",
    });
    const row = mapApiAttendanceToAdminAttendance(parsed);
    expect(row.scheduleId).toBeNull();
    expect(row.arrivalAt).toBeNull();
    expect(row.departureAt).toBeNull();
    expect(row.status).toBe("absent");
  });

  it("parse chaque statut reconnu", () => {
    for (const status of ["on_time", "late", "absent", "exception"] as const) {
      const parsed = apiAttendanceSchema.parse({ ...sample, status });
      expect(mapApiAttendanceToAdminAttendance(parsed).status).toBe(status);
    }
  });

  it("expose un statut inconnu sans le remapper", () => {
    const parsed = apiAttendanceSchema.parse({
      ...sample,
      status: "remote",
    });
    const row = mapApiAttendanceToAdminAttendance(parsed);
    expect(row.status).toBe("unknown");
    expect(row.statusRaw).toBe("remote");
  });
});

describe("mapApiAttendanceFromUnknown / safeMapApiAttendance", () => {
  it("mappe depuis une entrée brute valide", () => {
    const row = mapApiAttendanceFromUnknown(sample);
    expect(row.userId).toBe(UUID_B);
  });

  it("échoue sur données invalides", () => {
    expect(() =>
      mapApiAttendanceFromUnknown({ ...sample, attendance_date: "bad" })
    ).toThrow();
    const safe = safeMapApiAttendance({ ...sample, id: "not-uuid" });
    expect(safe.ok).toBe(false);
  });
});

describe("mapApiAttendancesToAdminAttendances", () => {
  it("mappe une liste", () => {
    const list = mapApiAttendancesToAdminAttendances([sample]);
    expect(list).toHaveLength(1);
    expect(list[0]?.status).toBe("late");
  });
});