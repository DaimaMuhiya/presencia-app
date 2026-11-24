import { z } from "zod";

import { uuidParamSchema } from "@/lib/employees/schemas";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isParseableIsoDateTime(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

export const apiScanLogSchema = z.object({
  id: uuidParamSchema,
  attendance_id: z
    .union([uuidParamSchema, z.null()])
    .optional()
    .transform((v) => v ?? null),
  user_id: uuidParamSchema,
  qr_token_id: z
    .union([uuidParamSchema, z.null()])
    .optional()
    .transform((v) => v ?? null),
  method: z.string().trim().min(1),
  scanned_at: z
    .string()
    .trim()
    .refine(isParseableIsoDateTime, "Horodatage de scan invalide."),
  is_success: z.boolean(),
  failure_reason: z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => (v === undefined || v === null ? null : v)),
});

export type ApiScanLogParsed = z.infer<typeof apiScanLogSchema>;

export const scanLogListQuerySchema = z
  .object({
    date: z
      .string()
      .trim()
      .regex(ISO_DATE, "date doit être au format AAAA-MM-JJ.")
      .optional(),
    user_id: uuidParamSchema.optional(),
    is_success: z.enum(["true", "false"]).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (!data.date || !data.user_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Les paramètres date et user_id sont obligatoires.",
        path: ["date"],
      });
    }
  });

export type ScanLogListQuery = z.infer<typeof scanLogListQuerySchema>;

export function toApiScanLogListQueryParams(
  query: ScanLogListQuery
): Record<string, string> {
  const params: Record<string, string> = {
    date: query.date!,
    user_id: query.user_id!,
  };
  if (query.is_success !== undefined) {
    params.is_success = query.is_success;
  }
  return params;
}