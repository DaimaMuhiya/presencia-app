import { describe, expect, it } from "vitest";

import type { OtpChallengeState } from "@/lib/auth/challenge-storage";

import {
  VERIFY_OTP_INITIAL_PHASE,
  canSubmitVerifyOtp,
  mapVerifyOtpError,
  phaseAfterChallengeLoad,
  shouldInvalidateOtpChallenge,
} from "./verify-otp-errors";

const sampleChallenge: OtpChallengeState = {
  challenge_id: "ch_test",
  remember: false,
};

describe("VERIFY_OTP_INITIAL_PHASE", () => {
  it("est loading pour aligner SSR et premier rendu client", () => {
    expect(VERIFY_OTP_INITIAL_PHASE).toBe("loading");
  });
});

describe("phaseAfterChallengeLoad", () => {
  it("passe en ready si un challenge est présent", () => {
    expect(phaseAfterChallengeLoad(sampleChallenge)).toBe("ready");
  });

  it("passe en missing sans challenge", () => {
    expect(phaseAfterChallengeLoad(null)).toBe("missing");
  });
});

describe("shouldInvalidateOtpChallenge", () => {
  it("invalide sur 401 et 403", () => {
    expect(shouldInvalidateOtpChallenge(401)).toBe(true);
    expect(shouldInvalidateOtpChallenge(403)).toBe(true);
  });

  it("conserve le challenge sur 422, 429 et 5xx", () => {
    expect(shouldInvalidateOtpChallenge(422)).toBe(false);
    expect(shouldInvalidateOtpChallenge(429)).toBe(false);
    expect(shouldInvalidateOtpChallenge(503)).toBe(false);
  });
});

describe("mapVerifyOtpError", () => {
  it("distingue 422 du 401", () => {
    expect(mapVerifyOtpError(422)).toContain("Code incorrect");
    expect(mapVerifyOtpError(401)).toContain("expiré");
  });

  it("mappe 403, 429 et 5xx", () => {
    expect(mapVerifyOtpError(403)).toContain("super administrateurs");
    expect(mapVerifyOtpError(429)).toContain("Trop de tentatives");
    expect(mapVerifyOtpError(503)).toContain("indisponible");
  });
});

describe("canSubmitVerifyOtp", () => {
  it("autorise la soumission uniquement en phase ready", () => {
    expect(canSubmitVerifyOtp("ready", true, false, 6)).toBe(true);
    expect(canSubmitVerifyOtp("loading", true, false, 6)).toBe(false);
    expect(canSubmitVerifyOtp("missing", true, false, 6)).toBe(false);
    expect(canSubmitVerifyOtp("session-ended", true, false, 6)).toBe(false);
  });

  it("bloque pendant la soumission et si le code est incomplet", () => {
    expect(canSubmitVerifyOtp("ready", true, true, 6)).toBe(false);
    expect(canSubmitVerifyOtp("ready", true, false, 5)).toBe(false);
    expect(canSubmitVerifyOtp("ready", false, false, 6)).toBe(false);
  });
});