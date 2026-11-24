import { describe, expect, it } from "vitest";

import type { AdminScanLog } from "./scan-log-types";

import {
  formatScanLogFailureReason,
  formatScanLogMethod,
  formatScanLogOutcome,
} from "./scan-log-display";

const log: AdminScanLog = {
  id: "11111111-2222-4333-8444-555555555555",
  attendanceId: null,
  userId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  qrTokenId: null,
  method: "qr_scan",
  scannedAt: "2026-11-12T08:00:00Z",
  isSuccess: false,
  failureReason: "qr_expired",
};

describe("scan-log-display", () => {
  it("formate méthode et issue", () => {
    expect(formatScanLogMethod("qr_scan")).toBe("Scan QR");
    expect(formatScanLogOutcome({ ...log, isSuccess: true })).toBe("Réussi");
    expect(formatScanLogOutcome(log)).toBe("Échoué");
    expect(formatScanLogFailureReason(log.failureReason)).toBe("qr_expired");
    expect(formatScanLogFailureReason(null)).toBe("—");
  });
});