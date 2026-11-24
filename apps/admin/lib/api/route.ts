import { ZodError, type ZodType } from "zod";

import { ApiClientError, toRouteErrorResponse } from "./errors";

export async function parseJsonBody<T>(
  request: Request,
  schema: ZodType<T>
): Promise<{ data: T } | Response> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json(
      { success: false, message: "Corps JSON invalide." },
      { status: 400 }
    );
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return zodValidationErrorResponse(parsed.error);
  }

  return { data: parsed.data };
}

export function zodValidationErrorResponse(error: ZodError): Response {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "body";
    errors[key] = issue.message;
  }

  return Response.json(
    {
      success: false,
      message: "Saisie invalide.",
      errors,
    },
    { status: 422 }
  );
}

export function handleRouteError(error: unknown): Response {
  if (error instanceof ApiClientError) {
    return toRouteErrorResponse(error);
  }

  if (error instanceof Error && error.message.includes("Configuration serveur")) {
    return Response.json(
      { success: false, message: "Configuration serveur indisponible." },
      { status: 503 }
    );
  }

  return Response.json(
    { success: false, message: "Erreur interne." },
    { status: 500 }
  );
}