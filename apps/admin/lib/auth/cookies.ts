import { cookies } from "next/headers";

import {
  assertCiSessionValue,
  isValidCiSessionValue,
} from "@/lib/auth/ci-session";

import {
  PHP_SESSION_COOKIE_NAME,
  PRESENCIA_COOKIES,
} from "@/lib/auth/cookie-names";

export { PHP_SESSION_COOKIE_NAME, PRESENCIA_COOKIES };

const DEFAULT_ACCESS_MAX_AGE = 15 * 60;
const DEFAULT_REFRESH_MAX_AGE = 12 * 60 * 60;
const PHP_SESSION_MAX_AGE = 10 * 60;

const OPAQUE_TOKEN_PATTERN = /^[\x21-\x7E]{20,512}$/;

type CookieOptions = {
  maxAge?: number;
  httpOnly: true;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  path: string;
};

function baseOptions(maxAge?: number): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
}

function assertOpaqueToken(name: string, token: string): string {
  if (!OPAQUE_TOKEN_PATTERN.test(token)) {
    throw new Error(`${name} : format de jeton invalide.`);
  }
  return token;
}

export async function setAccessTokenCookie(token: string, maxAge?: number) {
  const jar = await cookies();
  jar.set(
    PRESENCIA_COOKIES.access,
    assertOpaqueToken("access", token),
    baseOptions(maxAge ?? DEFAULT_ACCESS_MAX_AGE),
  );
}

export async function setRefreshTokenCookie(token: string, maxAge?: number) {
  const jar = await cookies();
  jar.set(
    PRESENCIA_COOKIES.refresh,
    assertOpaqueToken("refresh", token),
    baseOptions(maxAge ?? DEFAULT_REFRESH_MAX_AGE),
  );
}

export async function setPhpSessionCookie(sessionValue: string) {
  const jar = await cookies();
  jar.set(
    PRESENCIA_COOKIES.phpSession,
    assertCiSessionValue(sessionValue),
    baseOptions(PHP_SESSION_MAX_AGE),
  );
}

export async function clearPhpSessionCookie() {
  const jar = await cookies();
  jar.delete(PRESENCIA_COOKIES.phpSession);
}

export async function getAccessToken(): Promise<string | undefined> {
  const jar = await cookies();
  const value = jar.get(PRESENCIA_COOKIES.access)?.value;
  if (value && !OPAQUE_TOKEN_PATTERN.test(value)) {
    return undefined;
  }
  return value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const jar = await cookies();
  const value = jar.get(PRESENCIA_COOKIES.refresh)?.value;
  if (value && !OPAQUE_TOKEN_PATTERN.test(value)) {
    return undefined;
  }
  return value;
}

export async function getPhpSessionValue(): Promise<string | undefined> {
  const jar = await cookies();
  const value = jar.get(PRESENCIA_COOKIES.phpSession)?.value;
  if (!value || !isValidCiSessionValue(value)) {
    return undefined;
  }
  return value;
}

export async function clearPresenciaAuthCookies() {
  const jar = await cookies();
  for (const name of Object.values(PRESENCIA_COOKIES)) {
    jar.delete(name);
  }
}

function isCiSessionClearingCookie(raw: string): boolean {
  const lower = raw.toLowerCase();
  if (lower.includes("max-age=0")) {
    return true;
  }
  const pair = raw.split(";")[0]?.trim() ?? "";
  return /^ci_session=\s*"?$/i.test(pair);
}

function parseCiSessionValueFromSetCookie(raw: string): string | null {
  const firstPair = raw.split(";")[0]?.trim();
  if (!firstPair?.startsWith(`${PHP_SESSION_COOKIE_NAME}=`)) {
    return null;
  }
  let value = firstPair.slice(PHP_SESSION_COOKIE_NAME.length + 1).trim();
  if (value.startsWith('"') && value.endsWith('"')) {
    value = value.slice(1, -1);
  }
  try {
    value = decodeURIComponent(value);
  } catch {
    // conserve la valeur brute
  }
  if (!isValidCiSessionValue(value)) {
    return null;
  }
  return value;
}

export function extractCiSessionFromSetCookie(headers: Headers): string | null {
  const setCookies =
    typeof headers.getSetCookie === "function" ? headers.getSetCookie() : [];

  if (setCookies.length === 0) {
    const single = headers.get("set-cookie");
    if (single) {
      setCookies.push(single);
    }
  }

  const candidates: string[] = [];
  for (const raw of setCookies) {
    if (isCiSessionClearingCookie(raw)) {
      continue;
    }
    const value = parseCiSessionValueFromSetCookie(raw);
    if (value) {
      candidates.push(value);
    }
  }

  return candidates.at(-1) ?? null;
}

export function phpSessionCookieHeader(sessionValue: string): string {
  return `${PHP_SESSION_COOKIE_NAME}=${assertCiSessionValue(sessionValue)}`;
}
