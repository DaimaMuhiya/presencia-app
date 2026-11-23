import { handleRouteError } from "@/lib/api/route";
import { assertSameOrigin } from "@/lib/auth/guard";
import { refreshSessionFromCookies } from "@/lib/auth/refresh-session";

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) {
    return originError;
  }

  try {
    const result = await refreshSessionFromCookies();

    if (!result.ok) {
      return Response.json(
        { success: false, message: result.message },
        { status: result.status }
      );
    }

    return Response.json({
      success: true,
      message: "Session renouvelée.",
      data: { expiresIn: result.expiresIn },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}