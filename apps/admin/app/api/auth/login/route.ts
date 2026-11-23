import { callApi } from "@/lib/api/server-client";
import { handleRouteError, parseJsonBody } from "@/lib/api/route";
import {
  extractCiSessionFromSetCookie,
  setPhpSessionCookie,
} from "@/lib/auth/cookies";
import { assertSameOrigin } from "@/lib/auth/guard";
import { loginBodySchema } from "@/lib/auth/schemas";

type LoginChallengeData = {
  id: string;
  challenge_id: string;
};

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) {
    return originError;
  }

  const body = await parseJsonBody(request, loginBodySchema);
  if (body instanceof Response) {
    return body;
  }

  const { email, password, remember } = body.data;

  try {
    const { envelope, headers } = await callApi<LoginChallengeData>(
      "/auth/login",
      {
        method: "POST",
        body: { email, password, remember },
      }
    );

    const sessionValue = extractCiSessionFromSetCookie(headers);
    if (!sessionValue) {
      return Response.json(
        {
          success: false,
          message:
            "Session OTP indisponible. Réessayez dans quelques instants.",
        },
        { status: 502 }
      );
    }

    await setPhpSessionCookie(sessionValue);

    const data = envelope.data;
    return Response.json({
      success: true,
      message: envelope.message,
      data: data
        ? {
            id: data.id,
            challenge_id: data.challenge_id,
          }
        : undefined,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}