import { describe, expect, it } from "vitest";

import {
  assertHttpEnvelopeConsistency,
  parseApiEnvelopePayload,
} from "./envelope";

describe("parseApiEnvelopePayload", () => {
  it("accepte une enveloppe succès CI4", () => {
    const parsed = parseApiEnvelopePayload({
      success: true,
      message: "OK",
      data: { id: "1" },
    });
    expect(parsed?.ok).toBe(true);
    if (parsed?.ok) {
      expect(parsed.envelope.message).toBe("OK");
    }
  });

  it("accepte une enveloppe erreur CI4", () => {
    const parsed = parseApiEnvelopePayload({
      success: false,
      message: "Échec",
      errors: { email: "invalide" },
    });
    expect(parsed?.ok).toBe(false);
  });

  it("rejette un JSON non objet", () => {
    expect(parseApiEnvelopePayload(null)).toBeNull();
    expect(parseApiEnvelopePayload([])).toBeNull();
    expect(parseApiEnvelopePayload("texte")).toBeNull();
  });

  it("rejette success non booléen", () => {
    expect(
      parseApiEnvelopePayload({ success: "true", message: "x" })
    ).toBeNull();
  });
});

describe("assertHttpEnvelopeConsistency", () => {
  it("détecte 200 avec success false", () => {
    expect(assertHttpEnvelopeConsistency(200, false)).toBe(false);
  });

  it("détecte 401 avec success true", () => {
    expect(assertHttpEnvelopeConsistency(401, true)).toBe(false);
  });

  it("accepte 200 avec success true", () => {
    expect(assertHttpEnvelopeConsistency(200, true)).toBe(true);
  });
});