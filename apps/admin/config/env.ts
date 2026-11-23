import { z } from "zod";

const DEV_DEFAULT_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
] as const;

function parseOriginList(raw: string | undefined): string[] {
  if (!raw?.trim()) {
    return [];
  }
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizeToOrigin(value: string): string {
  const url = new URL(value);
  return url.origin;
}

const apiBaseUrlSchema = z
  .string()
  .url()
  .refine((url) => !url.endsWith("/"), {
    message: "API_BASE_URL ne doit pas se terminer par /",
  })
  .refine((url) => {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/\/+$/, "") || "/";
    return path === "/api/v1";
  }, "API_BASE_URL doit se terminer par le chemin /api/v1");

export type ServerEnv = {
  API_BASE_URL: string;
  ADMIN_APP_ORIGINS: string[];
};

function loadServerEnv(): ServerEnv {
  const isProduction = process.env.NODE_ENV === "production";

  const apiParsed = apiBaseUrlSchema.safeParse(process.env.API_BASE_URL);
  if (!apiParsed.success) {
    throw new Error(
      `API_BASE_URL invalide : ${apiParsed.error.issues.map((i) => i.message).join(", ")}`
    );
  }

  const API_BASE_URL = apiParsed.data;

  if (isProduction) {
    const apiUrl = new URL(API_BASE_URL);
    if (apiUrl.protocol !== "https:") {
      throw new Error(
        "En production, API_BASE_URL doit utiliser HTTPS (ex. https://api.example.com/api/v1)."
      );
    }
  }

  let originEntries = parseOriginList(process.env.ADMIN_APP_ORIGINS);
  if (originEntries.length === 0) {
    if (isProduction) {
      throw new Error(
        "ADMIN_APP_ORIGINS est obligatoire en production (ex. https://admin.example.com)."
      );
    }
    originEntries = [...DEV_DEFAULT_ORIGINS];
  }

  const ADMIN_APP_ORIGINS: string[] = [];
  for (const entry of originEntries) {
    try {
      const origin = normalizeToOrigin(entry);
      if (isProduction) {
        const parsed = new URL(origin);
        const localhost =
          parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
        if (!localhost && parsed.protocol !== "https:") {
          throw new Error(
            `En production, chaque origine admin doit être HTTPS : ${origin}`
          );
        }
      }
      ADMIN_APP_ORIGINS.push(origin);
    } catch {
      throw new Error(`Origine admin invalide : ${entry}`);
    }
  }

  return { API_BASE_URL, ADMIN_APP_ORIGINS };
}

let cached: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (!cached) {
    cached = loadServerEnv();
  }
  return cached;
}

export function getAllowedAdminOrigins(): ReadonlySet<string> {
  return new Set(getServerEnv().ADMIN_APP_ORIGINS);
}

export function resetServerEnvCacheForTests(): void {
  cached = null;
}