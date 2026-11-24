import { beforeEach, describe, expect, it, vi } from "vitest";

import { bffFetch, BffRequestError } from "@/lib/auth/bff-client";

import {
  buildScanLogsBffUrl,
  fetchScanLogsForAttendanceDay,
  mapBffScanLogError,
} from "./scan-logs-bff";

vi.mock("@/lib/auth/bff-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth/bff-client")>();
  return { ...actual, bffFetch: vi.fn() };
});

const USER = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

describe("buildScanLogsBffUrl", () => {
  it("encode date et user_id", () => {
    expect(buildScanLogsBffUrl({ date: "2026-11-12", user_id: USER })).toBe(
      `/api/super-admin/scan-logs?date=2026-11-12&user_id=${encodeURIComponent(USER)}`
    );
  });
});

describe("fetchScanLogsForAttendanceDay", () => {
  beforeEach(() => {
    vi.mocked(bffFetch).mockReset();
  });

  it("retourne les journaux", async () => {
    vi.mocked(bffFetch).mockResolvedValue({
      success: true,
      message: "OK",
      data: { scan_logs: [] },
    });
    await fetchScanLogsForAttendanceDay(USER, "2026-11-12");
    expect(vi.mocked(bffFetch)).toHaveBeenCalledWith(
      `/api/super-admin/scan-logs?date=2026-11-12&user_id=${encodeURIComponent(USER)}`,
      { method: "GET" }
    );
  });

  it("échoue sur réponse incomplète", async () => {
    vi.mocked(bffFetch).mockResolvedValue({
      success: true,
      message: "OK",
      data: undefined,
    });
    await expect(
      fetchScanLogsForAttendanceDay(USER, "2026-11-12")
    ).rejects.toBeInstanceOf(BffRequestError);
  });
});

describe("mapBffScanLogError", () => {
  it("mappe 429", () => {
    expect(
      mapBffScanLogError(
        new BffRequestError(429, { success: false, message: "x" })
      )
    ).toContain("Trop de requêtes");
  });

  it("mappe 503", () => {
    expect(
      mapBffScanLogError(
        new BffRequestError(503, { success: false, message: "down" })
      )
    ).toContain("down");
  });
});