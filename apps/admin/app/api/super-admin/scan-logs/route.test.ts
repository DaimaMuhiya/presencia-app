import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/session-api", () => ({
  requireSuperAdminSession: vi.fn(),
  callApiWithAccessToken: vi.fn(),
}));

import { ApiClientError } from "@/lib/api/errors";
import {
  callApiWithAccessToken,
  requireSuperAdminSession,
} from "@/lib/api/session-api";

import { GET } from "./route";

const UUID = "11111111-2222-4333-8444-555555555555";
const USER = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

function requestWithQuery(query: string) {
  return new Request(`http://localhost/api/super-admin/scan-logs?${query}`);
}

describe("GET /api/super-admin/scan-logs", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(requireSuperAdminSession).mockResolvedValue({
      accessToken: "token",
    });
  });

  it("retourne 422 si date ou user_id manquant", async () => {
    const res = await GET(requestWithQuery("date=2026-11-12"));
    expect(res.status).toBe(422);
  });

  it("normalise la réponse", async () => {
    vi.mocked(callApiWithAccessToken).mockResolvedValue({
      status: 200,
      envelope: {
        success: true,
        message: "Scans chargés.",
        data: {
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
        },
      },
      headers: new Headers(),
    });

    const res = await GET(
      requestWithQuery(`date=2026-11-12&user_id=${USER}`)
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.scan_logs[0].attendanceId).toBe(UUID);
  });

  it("retourne 502 sur data invalide", async () => {
    vi.mocked(callApiWithAccessToken).mockResolvedValue({
      status: 200,
      envelope: {
        success: true,
        message: "OK",
        data: { scan_logs: [{ id: "bad" }] },
      },
      headers: new Headers(),
    });
    const res = await GET(
      requestWithQuery(`date=2026-11-12&user_id=${USER}`)
    );
    expect(res.status).toBe(502);
  });

  it("propage une erreur API 5xx", async () => {
    vi.mocked(callApiWithAccessToken).mockRejectedValue(
      new ApiClientError(503, {
        success: false,
        message: "API injoignable.",
      })
    );
    const res = await GET(
      requestWithQuery(`date=2026-11-12&user_id=${USER}`)
    );
    expect(res.status).toBe(503);
  });
});