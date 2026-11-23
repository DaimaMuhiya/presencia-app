import type { ApiUserPublic } from "@/types/api/user";

export const SUPER_ADMIN_ROLE = "super_admin" as const;

export function isSuperAdmin(
  user: Pick<ApiUserPublic, "role"> | null | undefined
): boolean {
  return user?.role === SUPER_ADMIN_ROLE;
}