import { callApi } from "@/lib/api/server-client";
import { handleRouteError } from "@/lib/api/route";
import {
  getAccessToken,
  getRefreshToken,
} from "@/lib/auth/cookies";
import { assertSameOrigin } from "@/lib/auth/guard";
import { clearServerSession } from "@/lib/auth/tokens";

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) {
    return originError;
  }

  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();

  try {
    await callApi("/auth/logout", {
      method: "POST",
      accessToken: accessToken ?? undefined,
      body: refreshToken ? { refreshToken } : {},
    });
  } catch {
    /* La déconnexion locale reste effectuée même si l'API ne répond pas. */
  }

  try {
    await clearServerSession();
    return Response.json({
      success: true,
      message: "Déconnexion effectuée.",
    });
  } catch (error) {
    return handleRouteError(error);
  }
}