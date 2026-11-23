import type { OtpChallengeState } from "@/lib/auth/challenge-storage";

export type VerifyOtpPhase =
  | "loading"
  | "ready"
  | "missing"
  | "session-ended";

export const VERIFY_OTP_INITIAL_PHASE: VerifyOtpPhase = "loading";

export function phaseAfterChallengeLoad(
  challenge: OtpChallengeState | null
): Exclude<VerifyOtpPhase, "loading" | "session-ended"> {
  return challenge ? "ready" : "missing";
}

export function shouldInvalidateOtpChallenge(status: number): boolean {
  return status === 401 || status === 403;
}

export function mapVerifyOtpError(status: number, message?: string): string {
  if (status === 422) {
    return message || "Code incorrect. Vérifiez le code reçu par e-mail.";
  }
  if (status === 401) {
    return (
      message ||
      "Votre session de vérification a expiré. Reconnectez-vous pour continuer."
    );
  }
  if (status === 403) {
    return (
      message || "Accès réservé aux super administrateurs. Reconnectez-vous."
    );
  }
  if (status === 429) {
    return message || "Trop de tentatives. Patientez quelques minutes.";
  }
  if (status >= 500) {
    return "Serveur indisponible. Réessayez dans un instant.";
  }
  return message || "Impossible de vérifier le code pour le moment.";
}

export function canSubmitVerifyOtp(
  phase: VerifyOtpPhase,
  challengePresent: boolean,
  isSubmitting: boolean,
  codeLength: number
): boolean {
  if (phase !== "ready" || !challengePresent || isSubmitting) {
    return false;
  }
  return codeLength === 6;
}