import type { ApiUserPublic } from "@/types/api/user";

import { isSuperAdmin } from "./roles";

export type SessionUser = ApiUserPublic;

export function isAuthorizedAdminSession(
  user: SessionUser | null | undefined
): user is SessionUser {
  return isSuperAdmin(user);
}

export type MePayload = {
  user?: SessionUser;
};

export function parseMePayload(payload: unknown): SessionUser | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const record = payload as { success?: boolean; data?: MePayload };
  if (record.success !== true || !record.data?.user) {
    return null;
  }
  if (!isAuthorizedAdminSession(record.data.user)) {
    return null;
  }
  return record.data.user;
}