import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  bffFetch,
  parseRefreshSuccess,
  tryRefreshSession,
} from "./bff-client";

describe("parseRefreshSuccess", () => {
  it("renouvellement HTTP 200 avec success true", () => {
    expect(
      parseRefreshSuccess(true, { success: true, message: "Session renouvelée." })
    ).toBe(true);
  });

  it("renouvellement HTTP 200 avec success false", () => {
    expect(
      parseRefreshSuccess(true, { success: false, message: "Échec" })
    ).toBe(false);
  });
});

describe("tryRefreshSession / bffFetch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("absence de boucle de retry sur 401", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: false, message: "Non authentifié." }), {
          status: 401,
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true, message: "ok" }), {
          status: 200,
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true, message: "ok", data: {} }), {
          status: 200,
        })
      );

    const result = await bffFetch<{ ok: boolean }>("/api/auth/other", {
      skipRefreshRetry: false,
    });

    expect(result.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("tryRefreshSession échoue si success false", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ success: false, message: "Session expirée." }), {
        status: 200,
      })
    );

    await expect(tryRefreshSession()).resolves.toBe(false);
  });

  it("ne rafraîchit pas /api/auth/me côté client", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: false, message: "Non authentifié." }), {
        status: 401,
      })
    );

    await expect(
      bffFetch("/api/auth/me", { skipRefreshRetry: false })
    ).rejects.toMatchObject({ status: 401 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});