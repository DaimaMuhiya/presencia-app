import { handleRouteError, parseJsonBody } from "@/lib/api/route";
import {
  callApiWithAccessToken,
  requireSuperAdminSession,
} from "@/lib/api/session-api";
import { assertSameOrigin } from "@/lib/auth/guard";
import {
  toApiCreatePayload,
  userCreateBodySchema,
} from "@/lib/employees/schemas";
import type { ApiUserItemData, ApiUserListData } from "@/lib/employees/types";

export async function GET() {
  const session = await requireSuperAdminSession();
  if (session instanceof Response) {
    return session;
  }

  try {
    const { envelope } = await callApiWithAccessToken<ApiUserListData>(
      session.accessToken,
      "/super-admin/users",
      { method: "GET", skipJsonBody: true }
    );

    return Response.json({
      success: true,
      message: envelope.message,
      data: envelope.data,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) {
    return originError;
  }

  const session = await requireSuperAdminSession();
  if (session instanceof Response) {
    return session;
  }

  const body = await parseJsonBody(request, userCreateBodySchema);
  if (body instanceof Response) {
    return body;
  }

  try {
    const { envelope } = await callApiWithAccessToken<ApiUserItemData>(
      session.accessToken,
      "/super-admin/users",
      {
        method: "POST",
        body: toApiCreatePayload(body.data),
      }
    );

    return Response.json(
      {
        success: true,
        message: envelope.message,
        data: envelope.data,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}