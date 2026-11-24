import { describe, expect, it } from "vitest";

import {
  apiScanLogSchema,
  scanLogListQuerySchema,
  toApiScanLogListQueryParams,
} from "./scan-log-schemas";

const UUID = "11111111-2222-4333-8444-555555555555";
const USER = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

describe("scanLogListQuerySchema", () => {
  it("exige date et user_id", () => {
    expect(scanLogListQuerySchema.safeParse({ date: "2026-11-12" }).success).toBe(
      false
    );
    expect(
      scanLogListQuerySchema.safeParse({
        date: "2026-11-12",
        user_id: USER,
      }).success
    ).toBe(true);
  });

  it("rejette les clés inconnues", () => {
    expect(
      scanLogListQuerySchema.safeParse({
        date: "2026-11-12",
        user_id: USER,
        gps: "1",
      }).success
    ).toBe(false);
  });
});

describe("apiScanLogSchema", () => {
  it("accepte succès et échec", () => {
    expect(
      apiScanLogSchema.safeParse({
        id: UUID,
        attendance_id: UUID,
        user_id: USER,
        qr_token_id: null,
        method: "qr_scan",
        scanned_at: "2026-11-12T08:00:00Z",
        is_success: true,
        failure_reason: null,
      }).success
    ).toBe(true);
    expect(
      apiScanLogSchema.safeParse({
        id: UUID,
        attendance_id: null,
        user_id: USER,
        method: "qr_scan",
        scanned_at: "2026-11-12T09:00:00Z",
        is_success: false,
        failure_reason: "qr_expired",
      }).success
    ).toBe(true);
  });
});

describe("toApiScanLogListQueryParams", () => {
  it("transmet les filtres", () => {
    expect(
      toApiScanLogListQueryParams({
        date: "2026-11-12",
        user_id: USER,
        is_success: "false",
      })
    ).toEqual({
      date: "2026-11-12",
      user_id: USER,
      is_success: "false",
    });
  });
});