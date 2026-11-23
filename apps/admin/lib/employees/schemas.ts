import { z } from "zod";

const employmentStatusSchema = z.enum(["active", "inactive", "suspended"]);
const roleSchema = z.enum(["super_admin", "admin", "employee"]);

export const userCreateBodySchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Le prénom est obligatoire.")
    .max(100, "Le prénom ne peut pas dépasser 100 caractères."),
  lastName: z
    .string()
    .trim()
    .min(1, "Le nom est obligatoire.")
    .max(100, "Le nom ne peut pas dépasser 100 caractères."),
  email: z
    .string()
    .trim()
    .min(1, "L'e-mail professionnel est obligatoire.")
    .max(150, "L'e-mail ne peut pas dépasser 150 caractères.")
    .email("E-mail invalide."),
  phone: z
    .string()
    .trim()
    .max(30, "Le téléphone ne peut pas dépasser 30 caractères.")
    .optional(),
  role: roleSchema.optional(),
  jobTitle: z
    .string()
    .trim()
    .max(100, "Le poste ne peut pas dépasser 100 caractères.")
    .optional(),
  joiningDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date au format AAAA-MM-JJ.")
    .optional()
    .or(z.literal("")),
  employmentStatus: employmentStatusSchema.optional(),
});

export const userUpdateBodySchema = userCreateBodySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Aucune modification à enregistrer." }
);

export const userStatusBodySchema = z.object({
  employmentStatus: employmentStatusSchema,
});

export const uuidParamSchema = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    "Identifiant invalide."
  );

export type UserCreateBody = z.infer<typeof userCreateBodySchema>;
export type UserUpdateBody = z.infer<typeof userUpdateBodySchema>;
export type UserStatusBody = z.infer<typeof userStatusBodySchema>;

export function toApiCreatePayload(body: UserCreateBody): Record<string, unknown> {
  return {
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    ...(body.phone ? { phone: body.phone } : {}),
    ...(body.role ? { role: body.role } : {}),
    ...(body.jobTitle ? { jobTitle: body.jobTitle } : {}),
    ...(body.joiningDate ? { joiningDate: body.joiningDate } : {}),
    ...(body.employmentStatus
      ? { employmentStatus: body.employmentStatus }
      : {}),
  };
}

export function toApiUpdatePayload(body: UserUpdateBody): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (body.firstName !== undefined) {
    payload.firstName = body.firstName;
  }
  if (body.lastName !== undefined) {
    payload.lastName = body.lastName;
  }
  if (body.email !== undefined) {
    payload.email = body.email;
  }
  if (body.phone !== undefined) {
    payload.phone = body.phone;
  }
  if (body.role !== undefined) {
    payload.role = body.role;
  }
  if (body.jobTitle !== undefined) {
    payload.jobTitle = body.jobTitle;
  }
  if (body.joiningDate !== undefined && body.joiningDate !== "") {
    payload.joiningDate = body.joiningDate;
  }
  if (body.employmentStatus !== undefined) {
    payload.employmentStatus = body.employmentStatus;
  }
  return payload;
}