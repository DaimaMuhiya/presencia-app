import { ApiClientError } from "@/lib/api/errors";
import { callApi, type ApiRequestOptions } from "@/lib/api/server-client";
import { denyIfNotSuperAdmin } from "@/lib/auth/admin-access";
import { getAccessToken } from "@/lib/auth/cookies";
import { refreshSessionFromCookies } from "@/lib/auth/refresh-session";
import type { ApiUserPublic } from "@/types/api/user";

type MePayload = {
  user?: ApiUserPublic;
};

export async function resolveAccessToken(): Promise<string | null> {
  let accessToken = await getAccessToken();
  if (!accessToken) {
    const refreshed = await refreshSessionFromCookies();
    if (!refreshed.ok) {
      return null;
    }
    accessToken = await getAccessToken();
  }
  return accessToken ?? null;
}

async function callApiWithToken<T>(
  path: string,
  accessToken: string,
  options: ApiRequestOptions
) {
  return callApi<T>(path, { ...options, accessToken });
}

export async function callApiWithAccessToken<T>(
  accessToken: string,
  path: string,
  options: ApiRequestOptions = {}
) {
  try {
    return await callApiWithToken<T>(path, accessToken, options);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      const refreshed = await refreshSessionFromCookies();
      if (refreshed.ok) {
        const next = await getAccessToken();
        if (next) {
          return callApiWithToken<T>(path, next, options);
        }
      }
    }
    throw error;
  }
}

export async function callApiWithSession<T>(
  path: string,
  options: ApiRequestOptions = {}
) {
  const accessToken = await resolveAccessToken();
  if (!accessToken) {
    throw new ApiClientError(401, {
      success: false,
      message: "Non authentifié.",
    });
  }

  return callApiWithAccessToken<T>(accessToken, path, options);
}

export async function requireSuperAdminSession(): Promise<
  { accessToken: string } | Response
> {
  const accessToken = await resolveAccessToken();
  if (!accessToken) {
    return Response.json(
      { success: false, message: "Non authentifié." },
      { status: 401 }
    );
  }

  const loadMe = async (token: string) =>
    callApi<MePayload>("/auth/me", {
      method: "GET",
      accessToken: token,
      skipJsonBody: true,
    });

  try {
    const { envelope } = await loadMe(accessToken);
    const denied = await denyIfNotSuperAdmin(envelope.data?.user);
    if (denied) {
      return denied;
    }
    return { accessToken };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      const refreshed = await refreshSessionFromCookies();
      if (refreshed.ok) {
        const next = await getAccessToken();
        if (next) {
          try {
            const { envelope } = await loadMe(next);
            const denied = await denyIfNotSuperAdmin(envelope.data?.user);
            if (denied) {
              return denied;
            }
            return { accessToken: next };
          } catch (retryError) {
            if (retryError instanceof ApiClientError) {
              return Response.json(
                { success: false, message: retryError.message },
                { status: retryError.status }
              );
            }
          }
        }
      }
    }
    if (error instanceof ApiClientError) {
      return Response.json(
        { success: false, message: error.message },
        { status: error.status }
      );
    }
    return Response.json(
      { success: false, message: "Session indisponible." },
      { status: 503 }
    );
  }
}