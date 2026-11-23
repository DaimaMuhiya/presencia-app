import { z } from "zod";

export const loginBodySchema = z.object({
  email: z.string().email().max(150),
  password: z.string().min(8).max(255),
  remember: z.boolean().optional().default(false),
});

export const verifyOtpBodySchema = z.object({
  challenge_id: z.string().min(20).max(128),
  code: z.string().regex(/^\d{6}$/, "Le code doit contenir 6 chiffres."),
  remember: z.boolean().optional().default(false),
});

export type LoginBody = z.infer<typeof loginBodySchema>;
export type VerifyOtpBody = z.infer<typeof verifyOtpBodySchema>;