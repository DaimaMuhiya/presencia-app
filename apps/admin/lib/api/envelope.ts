import { z } from "zod";

import type { ApiEnvelope, ApiErrorBody, ApiSuccessBody } from "./errors";

const apiErrorEnvelopeSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  errors: z
    .record(z.string(), z.union([z.string(), z.array(z.string())]))
    .optional(),
});

const apiSuccessEnvelopeSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.unknown().optional(),
});

export type ParsedApiEnvelope =
  | { ok: true; envelope: ApiSuccessBody<unknown> }
  | { ok: false; envelope: ApiErrorBody };

/**
 * Valide la forme JSON renvoyée par CodeIgniter ({ success, message, data?, errors? }).
 */
export function parseApiEnvelopePayload(payload: unknown): ParsedApiEnvelope | null {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const asSuccess = apiSuccessEnvelopeSchema.safeParse(payload);
  if (asSuccess.success) {
    return {
      ok: true,
      envelope: asSuccess.data as ApiSuccessBody<unknown>,
    };
  }

  const asError = apiErrorEnvelopeSchema.safeParse(payload);
  if (asError.success) {
    return {
      ok: false,
      envelope: asError.data as ApiErrorBody,
    };
  }

  const record = payload as Record<string, unknown>;
  if (typeof record.success === "boolean" && typeof record.message === "string") {
    if (record.success === true) {
      return {
        ok: true,
        envelope: {
          success: true,
          message: record.message,
          data: record.data,
        },
      };
    }
    return {
      ok: false,
      envelope: {
        success: false,
        message: record.message,
        errors:
          record.errors &&
          typeof record.errors === "object" &&
          !Array.isArray(record.errors)
            ? (record.errors as ApiErrorBody["errors"])
            : undefined,
      },
    };
  }

  return null;
}

export function assertHttpEnvelopeConsistency(
  status: number,
  success: boolean
): boolean {
  const is2xx = status >= 200 && status < 300;
  if (is2xx && !success) {
    return false;
  }
  if (!is2xx && success) {
    return false;
  }
  return true;
}

export function envelopeToUnion<T>(parsed: ParsedApiEnvelope): ApiEnvelope<T> {
  return parsed.envelope as ApiEnvelope<T>;
}