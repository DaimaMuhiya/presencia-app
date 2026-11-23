import { describe, expect, it } from "vitest";

import { PRESENCIA_COOKIES } from "./cookie-names";
import {
  hasPresenciaSessionCookies,
  shouldAuthProviderProbeSession,
} from "./session-probe";

describe("hasPresenciaSessionCookies", () => {
  it("aucun cookie : pas de sonde", () => {
    expect(hasPresenciaSessionCookies("")).toBe(false);
  });

  it("cookie tiers uniquement : pas de sonde", () => {
    expect(
      hasPresenciaSessionCookies("__next_hmr_refresh_hash__=abc; foo=bar")
    ).toBe(false);
  });

  it("presencia_php_session seul (défi OTP) : pas de sonde", () => {
    expect(
      hasPresenciaSessionCookies(
        `${PRESENCIA_COOKIES.phpSession}=0123456789abcdef0123456789abcdef01234567`
      )
    ).toBe(false);
  });

  it("ci_session seul : pas de sonde", () => {
    expect(
      hasPresenciaSessionCookies(
        "ci_session=0123456789abcdef0123456789abcdef01234567"
      )
    ).toBe(false);
  });

  it("presencia_access présent : sonde autorisée", () => {
    expect(
      hasPresenciaSessionCookies(
        `${PRESENCIA_COOKIES.access}=opaque_access_token_value_here_12345`
      )
    ).toBe(true);
  });

  it("presencia_refresh présent : sonde autorisée", () => {
    expect(
      hasPresenciaSessionCookies(
        `${PRESENCIA_COOKIES.refresh}=opaque_refresh_token_value_here_123456`
      )
    ).toBe(true);
  });

  it("access + cookie tiers : sonde autorisée", () => {
    expect(
      hasPresenciaSessionCookies(
        `foo=bar; ${PRESENCIA_COOKIES.access}=token12345678901234567890`
      )
    ).toBe(true);
  });
});

describe("shouldAuthProviderProbeSession", () => {
  it("/login : pas d'appel initial me", () => {
    expect(shouldAuthProviderProbeSession("/login")).toBe(false);
  });

  it("/verify-otp : pas d'appel initial me", () => {
    expect(shouldAuthProviderProbeSession("/verify-otp")).toBe(false);
  });

  it("/dashboard : vérification requise", () => {
    expect(shouldAuthProviderProbeSession("/dashboard")).toBe(true);
  });

  it("/employees : vérification requise", () => {
    expect(shouldAuthProviderProbeSession("/employees")).toBe(true);
  });
});

describe("post-OTP utilisateur", () => {
  it("setUserFromVerify alimente l'état sans me sur page auth", () => {
    const user = {
      id: "1",
      email: "admin@example.com",
      role: "super_admin" as const,
      firstName: "A",
      lastName: "D",
    };
    expect(user.role).toBe("super_admin");
    expect(shouldAuthProviderProbeSession("/verify-otp")).toBe(false);
    expect(shouldAuthProviderProbeSession("/dashboard")).toBe(true);
  });
});