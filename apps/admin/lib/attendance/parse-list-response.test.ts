import { describe, expect, it } from "vitest";

import {
  AttendanceListDataError,
  normalizeAttendanceListData,
} from "./parse-list-response";

const UUID_A = "11111111-2222-4333-8444-555555555555";
const UUID_B = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

const row = {
  id: UUID_A,
  user_id: UUID_B,
  schedules_id: null,
  attendance_date: "2026-11-12",
  arrival_at: "2026-11-12T08:00:00Z",
  departure_at: null,
  status: "on_time",
};

describe("normalizeAttendanceListData", () => {
  it("mappe un tableau valide", () => {
    const data = normalizeAttendanceListData({
      attendances: [row],
      period: { from: "2026-11-12", to: "2026-11-12" },
    });
    expect(data.attendances).toHaveLength(1);
    expect(data.attendances[0]?.userId).toBe(UUID_B);
    expect(data.period?.from).toBe("2026-11-12");
  });

  it("rejette une enveloppe data sans attendances", () => {
    expect(() => normalizeAttendanceListData({})).toThrow(
      AttendanceListDataError
    );
  });

  it("rejette une présence invalide dans le tableau", () => {
    expect(() =>
      normalizeAttendanceListData({
        attendances: [{ ...row, id: "bad" }],
      })
    ).toThrow(AttendanceListDataError);
  });
});