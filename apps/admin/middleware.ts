import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  AUTH_LOGIN_PATH,
  isAuthRoutePath,
  isProtectedAppPath,
  isPublicPagePath,
  SERVICE_UNAVAILABLE_PATH,
} from "@/lib/auth/auth-routes";
import {
  classifySessionResponse,
  type SessionLoadResult,
} from "@/lib/auth/middleware-session";
import { hasPresenciaSessionCookies } from "@/lib/auth/session-probe";

async function loadAdminSession(
  request: NextRequest
): Promise<SessionLoadResult> {
  const cookie = request.headers.get("cookie") ?? "";
  if (!hasPresenciaSessionCookies(cookie)) {
    return { kind: "unauthenticated" };
  }

  try {
    const response = await fetch(new URL("/api/auth/me", request.url), {
      method: "GET",
      headers: {
        cookie,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      if (!response.ok) {
        return classifySessionResponse(response.status, null);
      }
      return { kind: "unavailable" };
    }

    return classifySessionResponse(response.status, payload);
  } catch {
    return { kind: "unavailable" };
  }
}

function redirectToServiceUnavailable(request: NextRequest): NextResponse {
  const url = new URL(SERVICE_UNAVAILABLE_PATH, request.url);
  if (request.nextUrl.pathname !== SERVICE_UNAVAILABLE_PATH) {
    url.searchParams.set(
      "from",
      request.nextUrl.pathname + request.nextUrl.search
    );
  }
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  if (pathname === SERVICE_UNAVAILABLE_PATH) {
    return NextResponse.next();
  }

  const session = await loadAdminSession(request);

  if (pathname === "/") {
    if (session.kind === "authenticated") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (session.kind === "unavailable") {
      return redirectToServiceUnavailable(request);
    }
    return NextResponse.redirect(new URL(AUTH_LOGIN_PATH, request.url));
  }

  if (isProtectedAppPath(pathname)) {
    if (session.kind === "authenticated") {
      return NextResponse.next();
    }
    if (session.kind === "unavailable") {
      return redirectToServiceUnavailable(request);
    }
    if (session.kind === "forbidden") {
      const loginUrl = new URL(AUTH_LOGIN_PATH, request.url);
      loginUrl.searchParams.set("error", "forbidden");
      return NextResponse.redirect(loginUrl);
    }
    const loginUrl = new URL(AUTH_LOGIN_PATH, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoutePath(pathname) && session.kind === "authenticated") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isPublicPagePath(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/service-unavailable",
    "/login",
    "/verify-otp",
    "/dashboard",
    "/dashboard/:path*",
    "/qr-management",
    "/qr-management/:path*",
    "/employees",
    "/employees/:path*",
    "/attendance",
    "/attendance/:path*",
    "/reports",
    "/reports/:path*",
    "/settings",
    "/settings/:path*",
    "/export",
    "/export/:path*",
  ],
};