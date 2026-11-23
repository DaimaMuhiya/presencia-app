import { describe, expect, it } from "vitest";

import {
  buildMiddlewareMatcher,
  isAuthRoutePath,
  isProtectedAppPath,
  PROTECTED_APP_PREFIXES,
} from "./auth-routes";

describe("auth route helpers", () => {
  it("détecte les routes protégées", () => {
    expect(isProtectedAppPath("/dashboard")).toBe(true);
    expect(isProtectedAppPath("/employees/1")).toBe(true);
    expect(isProtectedAppPath("/login")).toBe(false);
  });

  it("détecte les écrans auth", () => {
    expect(isAuthRoutePath("/login")).toBe(true);
    expect(isAuthRoutePath("/verify-otp")).toBe(true);
  });

  it("MIDDLEWARE_MATCHER couvre tous les préfixes protégés", () => {
    const matcher = buildMiddlewareMatcher();
    for (const prefix of PROTECTED_APP_PREFIXES) {
      expect(matcher).toContain(prefix);
      expect(matcher).toContain(`${prefix}/:path*`);
    }
  });

  it("MIDDLEWARE_MATCHER inclut les pages publiques auth", () => {
    expect(buildMiddlewareMatcher()).toEqual(
      expect.arrayContaining(["/", "/login", "/verify-otp", "/service-unavailable"])
    );
  });
});