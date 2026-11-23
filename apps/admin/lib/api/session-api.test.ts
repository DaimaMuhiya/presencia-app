import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { callApiWithSession } from "./session-api";

vi.mock("@/lib/auth/cookies", () => ({
  getAccessToken: vi.fn(),
}));

vi.mock("@/lib/auth/refresh-session", () => ({
  refreshSessionFromCookies: vi.fn(),
}));

vi.mock("@/lib/api/server-client", () => ({
  callApi: vi.fn(),
}));

import { getAccessToken } from "@/lib/auth/cookies";
import { callApi } from "@/lib/api/server-client";

describe("callApiWithSession", () => {
  beforeEach(() => {
    vi.mocked(getAccessToken).mockResolvedValue("token-a");
    vi.mocked(callApi).mockResolvedValue({
      status: 200,
      envelope: { success: true, message: "ok" },
      headers: new Headers(),
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("résout le jeton une seule fois avant l'appel", async () => {
    await callApiWithSession("/super-admin/users", {
      method: "GET",
      skipJsonBody: true,
    });
    expect(getAccessToken).toHaveBeenCalledTimes(1);
    expect(callApi).toHaveBeenCalledWith(
      "/super-admin/users",
      expect.objectContaining({ accessToken: "token-a" })
    );
  });
});