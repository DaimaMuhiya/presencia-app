import { describe, expect, it } from "vitest";

import {
  formatAttendanceStatusLabel,
  isKnownAttendanceStatus,
  parseAttendanceStatus,
} from "./attendance-status";

describe("parseAttendanceStatus", () => {
  it("reconnaît les statuts API", () => {
    expect(parseAttendanceStatus("on_time")).toEqual({ status: "on_time" });
    expect(parseAttendanceStatus("late")).toEqual({ status: "late" });
    expect(parseAttendanceStatus("absent")).toEqual({ status: "absent" });
    expect(parseAttendanceStatus("exception")).toEqual({ status: "exception" });
  });

  it("n'écrase pas un statut inconnu", () => {
    expect(parseAttendanceStatus("remote")).toEqual({
      status: "unknown",
      raw: "remote",
    });
    expect(parseAttendanceStatus("early_leave")).toEqual({
      status: "unknown",
      raw: "early_leave",
    });
    expect(parseAttendanceStatus(undefined)).toEqual({ status: "unknown" });
  });
});

describe("formatAttendanceStatusLabel", () => {
  it("libellés français pour les statuts connus", () => {
    expect(formatAttendanceStatusLabel("on_time")).toBe("À l'heure");
    expect(formatAttendanceStatusLabel("late")).toBe("En retard");
    expect(formatAttendanceStatusLabel("absent")).toBe("Absent");
    expect(formatAttendanceStatusLabel("exception")).toBe("Exception");
  });

  it("affiche unknown explicitement", () => {
    expect(formatAttendanceStatusLabel("unknown", "legacy")).toBe(
      "Statut inconnu (legacy)"
    );
  });
});

describe("isKnownAttendanceStatus", () => {
  it("distingue unknown", () => {
    expect(isKnownAttendanceStatus("late")).toBe(true);
    expect(isKnownAttendanceStatus("unknown")).toBe(false);
  });
});