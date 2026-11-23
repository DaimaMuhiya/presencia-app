const STORAGE_KEY = "presencia_admin_otp_challenge";

export type OtpChallengeState = {
  challenge_id: string;
  remember: boolean;
  next?: string;
};

export function saveOtpChallenge(state: OtpChallengeState): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function readOtpChallenge(): OtpChallengeState | null {
  if (typeof sessionStorage === "undefined") {
    return null;
  }
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as OtpChallengeState;
    if (!parsed.challenge_id || typeof parsed.remember !== "boolean") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearOtpChallenge(): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  sessionStorage.removeItem(STORAGE_KEY);
}