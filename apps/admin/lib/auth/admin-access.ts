import { clearPresenciaAuthCookies } from "@/lib/auth/cookies";
import type { ApiUserPublic } from "@/types/api/user";

import { isSuperAdmin } from "./roles";

export const ADMIN_ACCESS_DENIED_MESSAGE =
  "Accès réservé aux super administrateurs.";

export async function denyIfNotSuperAdmin(
  user: ApiUserPublic | null | undefined
): Promise<Response | null> {
  if (isSuperAdmin(user)) {
    return null;
  }

  await clearPresenciaAuthCookies();
  return Response.json(
    {
      success: false,
      message: ADMIN_ACCESS_DENIED_MESSAGE,
    },
    { status: 403 }
  );
}