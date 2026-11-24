import { describe, expect, it } from "vitest";

import {
  normalizeScanLogListData,
  ScanLogListDataError,
} from "./parse-scan-log-response";

const UUID = "11111111-2222-4333-8444-555555555555";
const USER = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

describe("normalizeScanLogListData", () => {
  it("mappe les scan logs", () => {
    const rows = normalizeScanLogListData({
      scan_logs: [
        {
          id: UUID,
          attendance_id: UUID,
          user_id: USER,
          qr_token_id: null,
          method: "qr_scan",
          scanned_at: "2026-11-12T08:00:00Z",
          is_success: true,
          failure_reason: null,
        },
      ],
    });
    expect(rows[0]?.attendanceId).toBe(UUID);
    expect(rows[0]?.isSuccess).toBe(true);
  });

  it("rejette une réponse invalide", () => {
    expect(() => normalizeScanLogListData({})).toThrow(ScanLogListDataError);
  });
});