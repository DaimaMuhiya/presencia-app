import { describe, expect, it } from "vitest";

import { BffRequestError } from "@/lib/auth/bff-client";

import {
  isUncertainCreateFailure,
  isValidationCreateFailure,
  mapCreateEmployeeError,
} from "./create-errors";

describe("mapCreateEmployeeError", () => {
  it("distingue 422 et erreurs réseau", () => {
    expect(
      mapCreateEmployeeError(
        new BffRequestError(422, {
          success: false,
          message: "Saisie invalide.",
          errors: { email: "Déjà utilisé" },
        })
      )
    ).toContain("Déjà utilisé");

    expect(
      mapCreateEmployeeError(
        new BffRequestError(503, {
          success: false,
          message: "Connexion temporairement indisponible.",
        })
      )
    ).toContain("Vérifiez la liste");
  });
});

describe("classificateurs", () => {
  it("repère incertitude et validation", () => {
    const uncertain = new BffRequestError(503, {
      success: false,
      message: "x",
    });
    const validation = new BffRequestError(422, {
      success: false,
      message: "x",
    });
    expect(isUncertainCreateFailure(uncertain)).toBe(true);
    expect(isValidationCreateFailure(validation)).toBe(true);
    expect(isValidationCreateFailure(uncertain)).toBe(false);
  });
});