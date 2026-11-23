import { parseMePayload, type SessionUser } from "@/lib/auth/session-policy";

export type SessionLoadResult =
  | { kind: "authenticated"; user: SessionUser }
  | { kind: "unauthenticated" }
  | { kind: "forbidden" }
  | { kind: "unavailable" };

const TRANSIENT_HTTP_STATUSES = new Set([502, 503, 504]);

export function classifySessionResponse(
  httpStatus: number,
  payload: unknown
): SessionLoadResult {
  if (TRANSIENT_HTTP_STATUSES.has(httpStatus)) {
    return { kind: "unavailable" };
  }

  if (httpStatus === 401) {
    return { kind: "unauthenticated" };
  }

  if (httpStatus === 403) {
    return { kind: "forbidden" };
  }

  if (httpStatus >= 500) {
    return { kind: "unavailable" };
  }

  if (httpStatus >= 400) {
    return { kind: "unauthenticated" };
  }

  const user = parseMePayload(payload);
  if (user) {
    return { kind: "authenticated", user };
  }

  if (httpStatus >= 200 && httpStatus < 300) {
    return { kind: "unauthenticated" };
  }

  return { kind: "unavailable" };
}

export function sessionLoadResultToNull(
  result: SessionLoadResult
): SessionUser | null {
  return result.kind === "authenticated" ? result.user : null;
}