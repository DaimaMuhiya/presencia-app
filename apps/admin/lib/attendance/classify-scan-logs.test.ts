import { describe, expect, it } from "vitest";

import type { AdminScanLog } from "./scan-log-types";

import { classifyScanLogsForAttendance } from "./classify-scan-logs";

const ATT_ID = "11111111-2222-4333-8444-555555555555";
const OTHER_ATT = "22222222-2222-4333-8444-555555555555";
const USER = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

function log(
  partial: Partial<AdminScanLog> & Pick<AdminScanLog, "id">
): AdminScanLog {
  return {
    id: partial.id,
    attendanceId: partial.attendanceId ?? null,
    userId: USER,
    qrTokenId: null,
    method: "qr_scan",
    scannedAt: partial.scannedAt ?? "2026-11-12T08:00:00Z",
    isSuccess: partial.isSuccess ?? true,
    failureReason: partial.failureReason ?? null,
  };
}

describe("classifyScanLogsForAttendance", () => {
  it("sépare les logs liés par attendance_id", () => {
    const result = classifyScanLogsForAttendance(
      [
        log({ id: "a", attendanceId: ATT_ID }),
        log({ id: "b", attendanceId: OTHER_ATT }),
        log({ id: "c", attendanceId: null, isSuccess: false }),
      ],
      ATT_ID
    );
    expect(result.linked).toHaveLength(1);
    expect(result.linked[0]?.id).toBe("a");
    expect(result.sameDayOther).toHaveLength(2);
  });

  it("ne relie pas un autre attendance_id", () => {
    const result = classifyScanLogsForAttendance(
      [log({ id: "x", attendanceId: OTHER_ATT })],
      ATT_ID
    );
    expect(result.linked).toHaveLength(0);
    expect(result.sameDayOther[0]?.id).toBe("x");
  });
});