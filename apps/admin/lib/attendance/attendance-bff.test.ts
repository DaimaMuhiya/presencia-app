import { beforeEach, describe, expect, it, vi } from "vitest";

import { BffRequestError, bffFetch } from "@/lib/auth/bff-client";

import {
  buildAttendanceListBffUrl,
  fetchAttendanceList,
  mapBffAttendanceError,
} from "./attendance-bff";

vi.mock("@/lib/auth/bff-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth/bff-client")>();
  return {
    ...actual,
    bffFetch: vi.fn(),
  };
});

const UUID_A = "11111111-2222-4333-8444-555555555555";
const UUID_B = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

describe("buildAttendanceListBffUrl", () => {
  it("construit l'URL avec les filtres", () => {
    expect(
      buildAttendanceListBffUrl({
        from: "2026-11-01",
        to: "2026-11-07",
      })
    ).toBe(
      "/api/super-admin/attendances?from=2026-11-01&to=2026-11-07"
    );
  });
});

describe("fetchAttendanceList", () => {
  beforeEach(() => {
    vi.mocked(bffFetch).mockReset();
  });

  it("retourne les présences et la période", async () => {
    vi.mocked(bffFetch).mockResolvedValue({
      success: true,
      message: "OK",
      data: {
        attendances: [
          {
            id: UUID_A,
            userId: UUID_B,
            scheduleId: null,
            attendanceDate: "2026-11-12",
            arrivalAt: null,
            departureAt: null,
            status: "on_time",
          },
        ],
        period: { from: "2026-11-12", to: "2026-11-12" },
      },
    });

    const result = await fetchAttendanceList({ date: "2026-11-12" });
    expect(result.attendances).toHaveLength(1);
    expect(vi.mocked(bffFetch)).toHaveBeenCalledWith(
      "/api/super-admin/attendances?date=2026-11-12",
      { method: "GET" }
    );
  });

  it("échoue sur réponse incomplète", async () => {
    vi.mocked(bffFetch).mockResolvedValue({
      success: true,
      message: "OK",
      data: undefined,
    });
    await expect(fetchAttendanceList({ date: "2026-11-12" })).rejects.toBeInstanceOf(
      BffRequestError
    );
  });
});

describe("mapBffAttendanceError", () => {
  it("mappe 401, 422 et 5xx", () => {
    expect(
      mapBffAttendanceError(
        new BffRequestError(401, { success: false, message: "x" })
      )
    ).toContain("Session");
    expect(
      mapBffAttendanceError(
        new BffRequestError(422, {
          success: false,
          message: "Saisie invalide.",
          errors: { from: "requis" },
        })
      )
    ).toContain("requis");
    expect(
      mapBffAttendanceError(
        new BffRequestError(503, { success: false, message: "down" })
      )
    ).toContain("down");
  });
});