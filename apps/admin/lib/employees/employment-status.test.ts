import { describe, expect, it } from "vitest";

import {
  formatEmploymentStatusLabel,
  isKnownEmploymentStatus,
  parseEmploymentStatus,
} from "./employment-status";

describe("parseEmploymentStatus", () => {
  it("reconnaît les statuts valides", () => {
    expect(parseEmploymentStatus("active")).toEqual({ status: "active" });
    expect(parseEmploymentStatus("suspended")).toEqual({ status: "suspended" });
  });

  it("expose unknown sans forcer inactive", () => {
    expect(parseEmploymentStatus("on_leave")).toEqual({
      status: "unknown",
      raw: "on_leave",
    });
    expect(parseEmploymentStatus(undefined)).toEqual({ status: "unknown" });
  });
});

describe("formatEmploymentStatusLabel", () => {
  it("affiche unknown explicitement", () => {
    expect(formatEmploymentStatusLabel("unknown", "legacy")).toBe(
      "Unknown (legacy)"
    );
  });
});

describe("isKnownEmploymentStatus", () => {
  it("distingue unknown", () => {
    expect(isKnownEmploymentStatus("active")).toBe(true);
    expect(isKnownEmploymentStatus("unknown")).toBe(false);
  });
});