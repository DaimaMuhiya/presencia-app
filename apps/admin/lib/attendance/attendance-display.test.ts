import { describe, expect, it } from "vitest";

import {
  formatAttendanceBusinessDate,
  formatAttendanceClockTime,
  formatAttendanceDateTime,
} from "./attendance-display";

describe("formatAttendanceBusinessDate", () => {
  it("formate une date métier AAAA-MM-JJ sans décalage civil", () => {
    const formatted = formatAttendanceBusinessDate("2026-11-12");
    expect(formatted).toMatch(/12/);
    expect(formatted).toMatch(/2026/);
  });

  it("retourne la chaîne brute si le format est invalide", () => {
    expect(formatAttendanceBusinessDate("12-11-2026")).toBe("12-11-2026");
  });
});

describe("formatAttendanceClockTime", () => {
  it("affiche — si null", () => {
    expect(formatAttendanceClockTime(null)).toBe("—");
  });

  it("préserve l'heure depuis ISO", () => {
    const formatted = formatAttendanceClockTime("2026-11-12T08:30:00Z");
    expect(formatted).not.toBe("—");
  });
});

describe("formatAttendanceDateTime", () => {
  it("formate une datetime ISO", () => {
    expect(formatAttendanceDateTime("2026-11-12T17:00:00Z")).not.toBe("—");
    expect(formatAttendanceDateTime("invalid")).toBe("—");
  });
});