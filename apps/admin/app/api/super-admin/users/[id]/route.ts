import { handleRouteError, parseJsonBody } from "@/lib/api/route";
import {
  callApiWithAccessToken,
  requireSuperAdminSession,
} from "@/lib/api/session-api";
import { assertSameOrigin } from "@/lib/auth/guard";
import {
  toApiUpdatePayload,
  userUpdateBodySchema,
  uuidParamSchema,
} from "@/lib/employees/schemas";
import type { ApiUserItemData } from "@/lib/employees/types";

type RouteContext = { params: Promise<{ id: string }> };

async function resolveId(context: RouteContext): Promise<string | Response> {
  const { id } = await context.params;
  const parsed = uuidParamSchema.safeParse(id);
  if (!parsed.success) {
    return Response.json(
      { success: false, message: "Identifiant de compte invalide." },
      { status: 400 }
    );
  }
  return parsed.data;
}

export async function GET(_request: Request, context: RouteContext) {
  const idOrError = await resolveId(context);
  if (idOrError instanceof Response) {
    return idOrError;
  }

  const session = await requireSuperAdminSession();
  if (session instanceof Response) {
    return session;
  }

  try {
    const { envelope } = await callApiWithAccessToken<ApiUserItemData>(
      session.accessToken,
      `/super-admin/users/${idOrError}`,
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

export async function PUT(request: Request, context: RouteContext) {
  const originError = assertSameOrigin(request);
  if (originError) {
    return originError;
  }

  const idOrError = await resolveId(context);
  if (idOrError instanceof Response) {
    return idOrError;
  }

  const session = await requireSuperAdminSession();
  if (session instanceof Response) {
    return session;
  }

  const body = await parseJsonBody(request, userUpdateBodySchema);
  if (body instanceof Response) {
    return body;
  }

  try {
    const { envelope } = await callApiWithAccessToken<ApiUserItemData>(
      session.accessToken,
      `/super-admin/users/${idOrError}`,
      {
        method: "PUT",
        body: toApiUpdatePayload(body.data),
      }
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

export async function DELETE(request: Request, context: RouteContext) {
  const originError = assertSameOrigin(request);
  if (originError) {
    return originError;
  }

  const idOrError = await resolveId(context);
  if (idOrError instanceof Response) {
    return idOrError;
  }

  const session = await requireSuperAdminSession();
  if (session instanceof Response) {
    return session;
  }

  try {
    const { envelope } = await callApiWithAccessToken<null>(
      session.accessToken,
      `/super-admin/users/${idOrError}`,
      { method: "DELETE", skipJsonBody: true }
    );

    return Response.json({
      success: true,
      message: envelope.message,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}