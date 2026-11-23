import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  getAllowedAdminOrigins,
  resetServerEnvCacheForTests,
} from "@/config/env";

import { checkRequestOrigin } from "./guard";

describe("checkRequestOrigin", () => {
  beforeEach(() => {
    process.env.API_BASE_URL = "http://169.58.184.9:8080/api/v1";
    process.env.ADMIN_APP_ORIGINS = "http://localhost:3000";
    resetServerEnvCacheForTests();
    expect(getAllowedAdminOrigins().has("http://localhost:3000")).toBe(true);
  });

  afterEach(() => {
    resetServerEnvCacheForTests();
  });

  it("refuse une requête sans Origin", () => {
    const result = checkRequestOrigin(null);
    expect(result.allowed).toBe(false);
    expect(result).toMatchObject({ status: 403 });
  });

  it("accepte une origine listée dans ADMIN_APP_ORIGINS", () => {
    expect(checkRequestOrigin("http://localhost:3000")).toEqual({
      allowed: true,
    });
  });

  it("refuse une origine arbitraire même si Host pourrait correspondre", () => {
    const result = checkRequestOrigin("https://evil.example.com");
    expect(result.allowed).toBe(false);
  });

  it("refuse une origine avec chemin ou query", () => {
    const result = checkRequestOrigin("http://localhost:3000/dashboard");
    expect(result.allowed).toBe(false);
  });
});