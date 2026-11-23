import { ApiClientError } from "@/lib/api/errors";
import { handleRouteError } from "@/lib/api/route";
import { callApi } from "@/lib/api/server-client";
import { denyIfNotSuperAdmin } from "@/lib/auth/admin-access";
import { getAccessToken } from "@/lib/auth/cookies";
import { refreshSessionFromCookies } from "@/lib/auth/refresh-session";
import type { ApiUserPublic } from "@/types/api/user";

type MeData = {
  user: ApiUserPublic;
};

export async function GET() {
  let accessToken = await getAccessToken();

  if (!accessToken) {
    const refreshed = await refreshSessionFromCookies();
    if (!refreshed.ok) {
      return Response.json(
        { success: false, message: "Non authentifié." },
        { status: 401 }
      );
    }
    accessToken = await getAccessToken();
  }

  if (!accessToken) {
    return Response.json(
      { success: false, message: "Non authentifié." },
      { status: 401 }
    );
  }

  try {
    const { envelope } = await callApi<MeData>("/auth/me", {
      method: "GET",
      accessToken,
      skipJsonBody: true,
    });

    const denied = await denyIfNotSuperAdmin(envelope.data?.user);
    if (denied) {
      return denied;
    }

    return Response.json({
      success: true,
      message: envelope.message,
      data: envelope.data,
    });
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      const refreshed = await refreshSessionFromCookies();
      if (refreshed.ok) {
        const nextToken = await getAccessToken();
        if (nextToken) {
          try {
            const { envelope } = await callApi<MeData>("/auth/me", {
              method: "GET",
              accessToken: nextToken,
              skipJsonBody: true,
            });
            const denied = await denyIfNotSuperAdmin(envelope.data?.user);
            if (denied) {
              return denied;
            }

            return Response.json({
              success: true,
              message: envelope.message,
              data: envelope.data,
            });
          } catch (retryError) {
            return handleRouteError(retryError);
          }
        }
      }
    }
    return handleRouteError(error);
  }
}