import { callApi } from "@/lib/api/server-client";
import { handleRouteError, parseJsonBody } from "@/lib/api/route";
import { cookies } from "next/headers";

import {
  clearPhpSessionCookie,
  getPhpSessionValue,
  PRESENCIA_COOKIES,
} from "@/lib/auth/cookies";
import { denyIfNotSuperAdmin } from "@/lib/auth/admin-access";
import { assertSameOrigin } from "@/lib/auth/guard";
import { shouldClearPhpSessionOnOtpFailure } from "@/lib/auth/otp-session";
import { ApiClientError } from "@/lib/api/errors";
import { verifyOtpBodySchema } from "@/lib/auth/schemas";
import {
  type ApiSessionData,
  persistSessionFromApi,
} from "@/lib/auth/tokens";

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) {
    return originError;
  }

  const body = await parseJsonBody(request, verifyOtpBodySchema);
  if (body instanceof Response) {
    return body;
  }

  const { challenge_id, code, remember } = body.data;
  const phpSession = await getPhpSessionValue();

  if (!phpSession) {
    return Response.json(
      {
        success: false,
        message: "Défi expiré. Recommencez la connexion.",
      },
      { status: 401 }
    );
  }

  try {
    const { envelope } = await callApi<ApiSessionData>("/auth/verify-otp", {
      method: "POST",
      body: { challenge_id, code },
      phpSessionValue: phpSession,
    });

    const data = envelope.data;
    if (!data?.user) {
      return Response.json(
        { success: false, message: "Réponse de connexion incomplète." },
        { status: 502 }
      );
    }

    const denied = await denyIfNotSuperAdmin(data.user);
    if (denied) {
      const jar = await cookies();
      jar.delete(PRESENCIA_COOKIES.phpSession);
      return denied;
    }

    const view = await persistSessionFromApi(data, {
      rememberRefresh: remember,
    });

    const jar = await cookies();
    jar.delete(PRESENCIA_COOKIES.phpSession);

    return Response.json({
      success: true,
      message: envelope.message,
      data: {
        user: view.user,
        expiresIn: view.expiresIn,
      },
    });
  } catch (error) {
    if (
      error instanceof ApiClientError &&
      shouldClearPhpSessionOnOtpFailure(error.status)
    ) {
      await clearPhpSessionCookie();
    }
    return handleRouteError(error);
  }
}