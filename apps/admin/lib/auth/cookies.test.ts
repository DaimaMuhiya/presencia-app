import { describe, expect, it } from "vitest";

import {
  extractCiSessionFromSetCookie,
  phpSessionCookieHeader,
} from "./cookies";
import { isValidCiSessionValue } from "./ci-session";

const VALID_SESSION = "0123456789abcdef0123456789abcdef01234567";

describe("ci_session", () => {
  it("valide un identifiant CI4 typique", () => {
    expect(isValidCiSessionValue(VALID_SESSION)).toBe(true);
  });

  it("rejette les caractères d'injection Cookie", () => {
    expect(isValidCiSessionValue("abc; Path=/")).toBe(false);
    expect(isValidCiSessionValue("abc\r\nX:Y")).toBe(false);
  });
});

describe("extractCiSessionFromSetCookie", () => {
  it("extrait ci_session depuis Set-Cookie", () => {
    const headers = new Headers();
    headers.append(
      "set-cookie",
      `ci_session=${VALID_SESSION}; Path=/; HttpOnly`,
    );
    expect(extractCiSessionFromSetCookie(headers)).toBe(VALID_SESSION);
  });

  it("ignore une valeur invalide", () => {
    const headers = new Headers();
    headers.append("set-cookie", "ci_session=short; HttpOnly");
    expect(extractCiSessionFromSetCookie(headers)).toBeNull();
  });

  it("prend la dernière ci_session après régénération", () => {
    const stale = "aaaaaaaabbbbbbbbccccccccdddddddd";
    const current = "eeeeeeeeffffffff0000000011111111";
    const headers = new Headers();
    headers.append("set-cookie", `ci_session=${stale}; HttpOnly; Max-Age=0`);
    headers.append("set-cookie", `ci_session=${current}; Path=/; HttpOnly`);
    expect(extractCiSessionFromSetCookie(headers)).toBe(current);
  });

  it("choisit la dernière session valide si plusieurs sont présentes", () => {
    const first = "11111111222222223333333344444444";
    const second = "55555555666666667777777788888888";
    const headers = new Headers();
    headers.append("set-cookie", `ci_session=${first}; HttpOnly`);
    headers.append("set-cookie", `ci_session=${second}; HttpOnly`);
    expect(extractCiSessionFromSetCookie(headers)).toBe(second);
  });
});

describe("phpSessionCookieHeader", () => {
  it("forme un en-tête Cookie sûr", () => {
    expect(phpSessionCookieHeader(VALID_SESSION)).toBe(
      `ci_session=${VALID_SESSION}`,
    );
  });
});
