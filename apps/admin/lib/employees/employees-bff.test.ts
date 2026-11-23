import { describe, expect, it } from "vitest";

import { BffRequestError } from "@/lib/auth/bff-client";

import { mapBffEmployeeError } from "./employees-bff";

describe("mapBffEmployeeError", () => {
  it("mappe 401, 403 et 422", () => {
    expect(
      mapBffEmployeeError(
        new BffRequestError(401, { success: false, message: "x" })
      )
    ).toContain("Session");
    expect(
      mapBffEmployeeError(
        new BffRequestError(403, { success: false, message: "Interdit" })
      )
    ).toBe("Interdit");
    expect(
      mapBffEmployeeError(
        new BffRequestError(422, {
          success: false,
          message: "Invalid",
          errors: { email: "Déjà utilisé" },
        })
      )
    ).toContain("Déjà utilisé");
  });
});