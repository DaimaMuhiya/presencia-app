import type { ApiUserPublic } from "@/types/api/user";

import {
  clearPresenciaAuthCookies,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "./cookies";

export type ApiSessionData = {
  user: ApiUserPublic;
  token: string;
  refreshToken: string;
  expiresIn: number;
};

const REFRESH_MAX_AGE_DEFAULT = 12 * 60 * 60;
const REFRESH_MAX_AGE_REMEMBER = 30 * 24 * 60 * 60;

export async function persistSessionFromApi(
  data: ApiSessionData,
  options?: { rememberRefresh?: boolean }
) {
  const refreshMaxAge = options?.rememberRefresh
    ? REFRESH_MAX_AGE_REMEMBER
    : REFRESH_MAX_AGE_DEFAULT;

  await setAccessTokenCookie(data.token, data.expiresIn);
  await setRefreshTokenCookie(data.refreshToken, refreshMaxAge);

  return {
    user: data.user,
    expiresIn: data.expiresIn,
  };
}

export async function clearServerSession() {
  await clearPresenciaAuthCookies();
}