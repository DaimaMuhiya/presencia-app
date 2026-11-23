import { isAuthRoutePath } from "@/lib/auth/auth-routes";

import { PRESENCIA_COOKIES } from "./cookie-names";

function cookieNamesFromHeader(cookieHeader: string): Set<string> {
  const names = new Set<string>();
  if (!cookieHeader.trim()) {
    return names;
  }

  for (const segment of cookieHeader.split(";")) {
    const pair = segment.trim();
    if (!pair) {
      continue;
    }
    const eq = pair.indexOf("=");
    if (eq <= 0) {
      continue;
    }
    names.add(pair.slice(0, eq).trim());
  }

  return names;
}

export function hasPresenciaSessionCookies(cookieHeader: string): boolean {
  const names = cookieNamesFromHeader(cookieHeader);
  return (
    names.has(PRESENCIA_COOKIES.access) ||
    names.has(PRESENCIA_COOKIES.refresh)
  );
}

export function shouldAuthProviderProbeSession(pathname: string): boolean {
  return !isAuthRoutePath(pathname);
}