import { getServerEnv } from "@/config/env";
import { phpSessionCookieHeader } from "@/lib/auth/cookies";

import {
  type ApiSuccessBody,
  ApiClientError,
  isApiSuccess,
  normalizeApiError,
} from "./errors";
import {
  assertHttpEnvelopeConsistency,
  envelopeToUnion,
  parseApiEnvelopePayload,
} from "./envelope";

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  accessToken?: string;
  phpSessionValue?: string;
  skipJsonBody?: boolean;
};

export type ApiCallResult<T> = {
  status: number;
  envelope: ApiSuccessBody<T>;
  headers: Headers;
};

function buildUrl(path: string): string {
  const { API_BASE_URL } = getServerEnv();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized.includes("//")) {
    throw new Error("Chemin API invalide.");
  }
  return `${API_BASE_URL}${normalized}`;
}

export async function callApi<T = unknown>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<ApiCallResult<T>> {
  const {
    method = "GET",
    body,
    accessToken,
    phpSessionValue,
    skipJsonBody,
  } = options;

  const headers = new Headers({
    Accept: "application/json",
  });

  if (!skipJsonBody && body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  if (phpSessionValue) {
    headers.set("Cookie", phpSessionCookieHeader(phpSessionValue));
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path), {
      method,
      headers,
      body:
        skipJsonBody || body === undefined
          ? undefined
          : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new ApiClientError(503, {
      success: false,
      message: "API temporairement injoignable.",
    });
  }

  const text = await response.text();

  if (!text.trim()) {
    throw new ApiClientError(response.status, {
      success: false,
      message: response.ok
        ? "Réponse API vide."
        : response.statusText || "Réponse API vide.",
    });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(text) as unknown;
  } catch {
    throw new ApiClientError(response.status, {
      success: false,
      message: "Réponse API non JSON.",
    });
  }

  const parsed = parseApiEnvelopePayload(payload);
  if (!parsed) {
    throw new ApiClientError(response.status, {
      success: false,
      message: "Enveloppe API invalide.",
    });
  }

  const success = parsed.ok;
  if (!assertHttpEnvelopeConsistency(response.status, success)) {
    throw new ApiClientError(response.status, {
      success: false,
      message: "Incohérence entre le statut HTTP et l'enveloppe API.",
    });
  }

  const envelope = envelopeToUnion<T>(parsed);

  if (!response.ok || !isApiSuccess(envelope)) {
    throw normalizeApiError(response.status, envelope);
  }

  return {
    status: response.status,
    envelope: envelope as ApiSuccessBody<T>,
    headers: response.headers,
  };
}