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

const UUID_A = "11111111-2222-4333-8444-555555555555";
const UUID_B = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

const validRow = {
  id: UUID_A,
  user_id: UUID_B,
  schedules_id: null,
  attendance_date: "2026-11-12",
  arrival_at: null,
  departure_at: null,
  status: "on_time",
};

function requestWithQuery(query: string) {
  return new Request(`http://localhost/api/super-admin/attendances?${query}`);
}

describe("GET /api/super-admin/attendances", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(requireSuperAdminSession).mockResolvedValue({
      accessToken: "token-test",
    });
  });

  it("retourne 403 si rôle non autorisé", async () => {
    vi.mocked(requireSuperAdminSession).mockResolvedValue(
      Response.json(
        { success: false, message: "Vous n'avez pas accès à cette action." },
        { status: 403 }
      )
    );
    const res = await GET(requestWithQuery("date=2026-11-12"));
    expect(res.status).toBe(403);
  });

  it("retourne 401 si session absente", async () => {
    vi.mocked(requireSuperAdminSession).mockResolvedValue(
      Response.json({ success: false, message: "Non authentifié." }, { status: 401 })
    );
    const res = await GET(requestWithQuery("date=2026-11-12"));
    expect(res.status).toBe(401);
  });

  it("retourne 422 si période absente", async () => {
    const res = await GET(requestWithQuery(""));
    expect(res.status).toBe(422);
  });

  it("transmet les paramètres et normalise la réponse", async () => {
    vi.mocked(callApiWithAccessToken).mockResolvedValue({
      status: 200,
      envelope: {
        success: true,
        message: "Présences chargées.",
        data: {
          attendances: [validRow],
          period: { from: "2026-11-12", to: "2026-11-12" },
        },
      },
      headers: new Headers(),
    });

    const res = await GET(requestWithQuery("date=2026-11-12&status=on_time"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.attendances[0].userId).toBe(UUID_B);
    expect(callApiWithAccessToken).toHaveBeenCalledWith(
      "token-test",
      "/super-admin/attendances?date=2026-11-12&status=on_time",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("propage une erreur API 422", async () => {
    vi.mocked(callApiWithAccessToken).mockRejectedValue(
      new ApiClientError(422, {
        success: false,
        message: "Le paramètre month doit être au format AAAA-MM.",
      })
    );
    const res = await GET(requestWithQuery("month=2026-11"));
    expect(res.status).toBe(422);
  });

  it("propage une erreur API 5xx", async () => {
    vi.mocked(callApiWithAccessToken).mockRejectedValue(
      new ApiClientError(503, {
        success: false,
        message: "API temporairement injoignable.",
      })
    );
    const res = await GET(requestWithQuery("week=2026-W46"));
    expect(res.status).toBe(503);
  });

  it("retourne 502 si data invalide", async () => {
    vi.mocked(callApiWithAccessToken).mockResolvedValue({
      status: 200,
      envelope: {
        success: true,
        message: "OK",
        data: { attendances: [{ id: "not-uuid", user_id: UUID_B }] },
      },
      headers: new Headers(),
    });
    const res = await GET(requestWithQuery("date=2026-11-12"));
    expect(res.status).toBe(502);
  });
});