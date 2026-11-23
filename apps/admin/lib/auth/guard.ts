import { getAllowedAdminOrigins } from "@/config/env";

export type OriginCheckResult =
  | { allowed: true }
  | { allowed: false; status: number; message: string };

export function checkRequestOrigin(origin: string | null): OriginCheckResult {
  if (!origin) {
    return {
      allowed: false,
      status: 403,
      message: "Origine requise pour cette requête.",
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    return {
      allowed: false,
      status: 403,
      message: "Origine invalide.",
    };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      allowed: false,
      status: 403,
      message: "Schéma d'origine non autorisé.",
    };
  }

  if (parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search) {
    return {
      allowed: false,
      status: 403,
      message: "L'origine ne doit contenir que schéma, hôte et port.",
    };
  }

  const allowed = getAllowedAdminOrigins();
  if (!allowed.has(parsed.origin)) {
    return {
      allowed: false,
      status: 403,
      message: "Origine non autorisée.",
    };
  }

  return { allowed: true };
}

export function assertSameOrigin(request: Request): Response | null {
  const result = checkRequestOrigin(request.headers.get("origin"));

  if (!result.allowed) {
    return Response.json(
      { success: false, message: result.message },
      { status: result.status }
    );
  }

  return null;
}