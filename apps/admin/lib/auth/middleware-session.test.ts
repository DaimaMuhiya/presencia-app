import { describe, expect, it } from "vitest";

import { classifySessionResponse } from "./middleware-session";

const superAdminPayload = {
  success: true,
  message: "ok",
  data: {
    user: {
      id: "1",
      email: "a@b.cd",
      role: "super_admin",
      firstName: "Ada",
      lastName: "Min",
    },
  },
};

describe("classifySessionResponse", () => {
  it("session valide super_admin", () => {
    const result = classifySessionResponse(200, superAdminPayload);
    expect(result.kind).toBe("authenticated");
  });

  it("401 absence de session", () => {
    expect(classifySessionResponse(401, { success: false, message: "x" }).kind).toBe(
      "unauthenticated"
    );
  });

  it("403 accès refusé", () => {
    expect(classifySessionResponse(403, { success: false, message: "x" }).kind).toBe(
      "forbidden"
    );
  });

  it("503 indisponibilité temporaire", () => {
    expect(classifySessionResponse(503, null).kind).toBe("unavailable");
  });

  it("réseau / JSON invalide traité via statut", () => {
    expect(classifySessionResponse(502, null).kind).toBe("unavailable");
  });

  it("200 success false sans user", () => {
    expect(
      classifySessionResponse(200, { success: false, message: "x" }).kind
    ).toBe("unauthenticated");
  });
});