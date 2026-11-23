import { isProtectedAppPath } from "@/lib/auth/auth-routes";

export const DEFAULT_POST_AUTH_PATH = "/dashboard";

export function resolveSafeNextParam(
  next: string | null | undefined
): string {
  if (!next?.trim()) {
    return DEFAULT_POST_AUTH_PATH;
  }

  const raw = next.trim();

  if (!raw.startsWith("/") || raw.startsWith("//")) {
    return DEFAULT_POST_AUTH_PATH;
  }

  if (
    raw.includes("://") ||
    raw.includes("\\") ||
    raw.includes("\0") ||
    raw.includes("?") ||
    raw.includes("#")
  ) {
    return DEFAULT_POST_AUTH_PATH;
  }

  const pathname = raw;

  if (!isProtectedAppPath(pathname)) {
    return DEFAULT_POST_AUTH_PATH;
  }

  return pathname;
}