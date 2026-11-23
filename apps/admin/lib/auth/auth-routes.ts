export const AUTH_LOGIN_PATH = "/login";
export const AUTH_VERIFY_OTP_PATH = "/verify-otp";
export const SERVICE_UNAVAILABLE_PATH = "/service-unavailable";

export const PROTECTED_APP_PREFIXES = [
  "/dashboard",
  "/qr-management",
  "/employees",
  "/attendance",
  "/reports",
  "/settings",
  "/export",
] as const;

export const AUTH_ROUTE_PATHS = [AUTH_LOGIN_PATH, AUTH_VERIFY_OTP_PATH] as const;

export const PUBLIC_PAGE_PATHS = [
  ...AUTH_ROUTE_PATHS,
  SERVICE_UNAVAILABLE_PATH,
] as const;

export function isProtectedAppPath(pathname: string): boolean {
  return PROTECTED_APP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isAuthRoutePath(pathname: string): boolean {
  return AUTH_ROUTE_PATHS.includes(
    pathname as (typeof AUTH_ROUTE_PATHS)[number]
  );
}

export function isPublicPagePath(pathname: string): boolean {
  return PUBLIC_PAGE_PATHS.some((path) => pathname === path);
}

export const MIDDLEWARE_MATCHER = [
  "/",
  SERVICE_UNAVAILABLE_PATH,
  AUTH_LOGIN_PATH,
  AUTH_VERIFY_OTP_PATH,
  ...PROTECTED_APP_PREFIXES.flatMap((prefix) => [prefix, `${prefix}/:path*`]),
] as const;

export function buildMiddlewareMatcher(): readonly string[] {
  return MIDDLEWARE_MATCHER;
}