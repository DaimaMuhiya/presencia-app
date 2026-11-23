import { ApiClientError } from "@/lib/api/errors";
import { callApi } from "@/lib/api/server-client";
import {
  clearPresenciaAuthCookies,
  getAccessToken,
  getRefreshToken,
} from "@/lib/auth/cookies";
import {
  getRefreshCoordinator,
  isTransientRefreshFailure,
  refreshCoordinatorScopeKey,
  shouldClearAuthCookiesOnRefreshFailure,
} from "@/lib/auth/refresh-coordinator";
import {
  type ApiSessionData,
  persistSessionFromApi,
} from "@/lib/auth/tokens";

export type RefreshSessionResult =
  | { ok: true; expiresIn: number }
  | { ok: false; status: number; message: string };

async function refreshSessionWithToken(
  refreshToken: string
): Promise<RefreshSessionResult> {
  try {
    const { envelope } = await callApi<ApiSessionData>("/auth/refresh", {
      method: "POST",
      body: { refreshToken },
    });

    const data = envelope.data;
    if (!data?.token || !data.refreshToken) {
      return {
        ok: false,
        status: 502,
        message: "Réponse de renouvellement incomplète.",
      };
    }

    const view = await persistSessionFromApi(data);

    return { ok: true, expiresIn: view.expiresIn };
  } catch (error) {
    if (error instanceof ApiClientError) {
      if (shouldClearAuthCookiesOnRefreshFailure(error.status)) {
        await clearPresenciaAuthCookies();
      }
      return {
        ok: false,
        status: error.status,
        message: error.message,
      };
    }

    if (isTransientRefreshFailure(error)) {
      return {
        ok: false,
        status: 503,
        message: "Renouvellement temporairement indisponible.",
      };
    }

    throw error;
  }
}

export async function refreshSessionFromCookies(): Promise<RefreshSessionResult> {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return {
      ok: false,
      status: 401,
      message: "Session expirée.",
    };
  }

  const coordinator = getRefreshCoordinator();
  const scopeKey = refreshCoordinatorScopeKey(refreshToken);

  return coordinator.run(scopeKey, () => refreshSessionWithToken(refreshToken));
}

export async function getValidAccessToken(): Promise<string | null> {
  const access = await getAccessToken();
  if (access) {
    return access;
  }

  const refreshed = await refreshSessionFromCookies();
  if (!refreshed.ok) {
    return null;
  }

  return (await getAccessToken()) ?? null;
}