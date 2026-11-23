import { describe, expect, it } from "vitest";

import { DEFAULT_POST_AUTH_PATH, resolveSafeNextParam } from "./safe-next";

describe("resolveSafeNextParam", () => {
  it("défaut sans paramètre", () => {
    expect(resolveSafeNextParam(null)).toBe(DEFAULT_POST_AUTH_PATH);
  });

  it("accepte un chemin interne protégé", () => {
    expect(resolveSafeNextParam("/employees")).toBe("/employees");
  });

  it("rejette une URL externe", () => {
    expect(resolveSafeNextParam("https://evil.example/phishing")).toBe(
      DEFAULT_POST_AUTH_PATH
    );
  });

  it("rejette protocol-relative", () => {
    expect(resolveSafeNextParam("//evil.example")).toBe(DEFAULT_POST_AUTH_PATH);
  });

  it("rejette un chemin hors périmètre admin", () => {
    expect(resolveSafeNextParam("/login")).toBe(DEFAULT_POST_AUTH_PATH);
  });
});