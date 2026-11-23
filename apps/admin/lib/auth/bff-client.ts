import type { ApiUserPublic } from "@/types/api/user";

export type BffSuccess<T> = {
  success: true;
  message: string;
  data?: T;
};

export type BffError = {
  success: false;
  message: string;
  errors?: Record<string, string | string[]>;
};

export type BffEnvelope<T> = BffSuccess<T> | BffError;

export class BffRequestError extends Error {
  readonly status: number;
  readonly body: BffError;

  constructor(status: number, body: BffError) {
    super(body.message || `Erreur (${status})`);
    this.name = "BffRequestError";
    this.status = status;
    this.body = body;
  }
}

type BffFetchOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  skipRefreshRetry?: boolean;
};

let refreshInFlight: Promise<boolean> | null = null;

const TRANSIENT_REFRESH_FAILURE = new Set([502, 503, 504]);

export function isTransientHttpStatus(status: number): boolean {
  return TRANSIENT_REFRESH_FAILURE.has(status);
}

export function parseRefreshSuccess(
  httpOk: boolean,
  payload: unknown
): boolean {
  if (!httpOk) {
    return false;
  }
  if (!payload || typeof payload !== "object") {
    return false;
  }
  return (payload as BffEnvelope<unknown>).success === true;
}

export async function tryRefreshSession(): Promise<boolean> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      let payload: unknown = null;
      try {
        payload = await res.json();
      } catch {
        return false;
      }

      return parseRefreshSuccess(res.ok, payload);
    } catch {
      return false;
    }
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

const NO_CLIENT_REFRESH_PATHS = new Set([
  "/api/auth/refresh",
  "/api/auth/login",
  "/api/auth/verify-otp",
  "/api/auth/me",
]);

export async function bffFetch<T>(
  path: string,
  options: BffFetchOptions = {}
): Promise<BffSuccess<T>> {
  const { method = "GET", body, skipRefreshRetry } = options;

  const headers = new Headers({ Accept: "application/json" });
  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const run = async () =>
    fetch(path, {
      method,
      credentials: "include",
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

  let response: Response;
  try {
    response = await run();
  } catch {
    throw new BffRequestError(503, {
      success: false,
      message: "Connexion temporairement indisponible.",
    });
  }

  let payload: BffEnvelope<T>;
  try {
    payload = (await response.json()) as BffEnvelope<T>;
  } catch {
    throw new BffRequestError(response.status, {
      success: false,
      message: "Réponse serveur invalide.",
    });
  }

  if (
    !skipRefreshRetry &&
    response.status === 401 &&
    !NO_CLIENT_REFRESH_PATHS.has(path)
  ) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      return bffFetch<T>(path, { ...options, skipRefreshRetry: true });
    }
  }

  if (!response.ok || payload.success === false) {
    const errBody: BffError =
      payload.success === false
        ? payload
        : { success: false, message: "Erreur inattendue." };
    throw new BffRequestError(response.status, errBody);
  }

  return payload;
}

export type LoginChallengeResponse = {
  id: string;
  challenge_id: string;
};

export type VerifyOtpResponse = {
  user: ApiUserPublic;
  expiresIn: number;
};

export type MeResponse = {
  user: ApiUserPublic;
};