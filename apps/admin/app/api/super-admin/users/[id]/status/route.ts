import { handleRouteError, parseJsonBody } from "@/lib/api/route";
import {
  callApiWithAccessToken,
  requireSuperAdminSession,
} from "@/lib/api/session-api";
import { assertSameOrigin } from "@/lib/auth/guard";
import { userStatusBodySchema, uuidParamSchema } from "@/lib/employees/schemas";
import type { ApiUserItemData } from "@/lib/employees/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const originError = assertSameOrigin(request);
  if (originError) {
    return originError;
  }

  const { id } = await context.params;
  const parsedId = uuidParamSchema.safeParse(id);
  if (!parsedId.success) {
    return Response.json(
      { success: false, message: "Identifiant de compte invalide." },
      { status: 400 }
    );
  }

  const session = await requireSuperAdminSession();
  if (session instanceof Response) {
    return session;
  }

  const body = await parseJsonBody(request, userStatusBodySchema);
  if (body instanceof Response) {
    return body;
  }

  try {
    const { envelope } = await callApiWithAccessToken<ApiUserItemData>(
      session.accessToken,
      `/super-admin/users/${parsedId.data}/status`,
      {
        method: "PUT",
        body: { employmentStatus: body.data.employmentStatus },
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