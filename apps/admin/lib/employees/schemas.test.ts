import { describe, expect, it } from "vitest";

import {
  toApiCreatePayload,
  toApiUpdatePayload,
  userCreateBodySchema,
  userStatusBodySchema,
  uuidParamSchema,
} from "./schemas";

describe("userCreateBodySchema", () => {
  it("valide une création minimale", () => {
    const parsed = userCreateBodySchema.safeParse({
      firstName: "Alice",
      lastName: "Martin",
      email: "alice@corp.test",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejette un e-mail invalide", () => {
    const parsed = userCreateBodySchema.safeParse({
      firstName: "Alice",
      lastName: "Martin",
      email: "not-an-email",
    });
    expect(parsed.success).toBe(false);
  });

  it("respecte les longueurs max alignées API", () => {
    const long = "a".repeat(101);
    expect(
      userCreateBodySchema.safeParse({
        firstName: long,
        lastName: "Martin",
        email: "alice@corp.test",
      }).success
    ).toBe(false);
    expect(
      userCreateBodySchema.safeParse({
        firstName: "Alice",
        lastName: "Martin",
        email: `${"a".repeat(146)}@x.co`,
      }).success
    ).toBe(false);
  });
});

describe("toApiCreatePayload", () => {
  it("n'inclut pas de mot de passe ni matricule", () => {
    const payload = toApiCreatePayload({
      firstName: "Alice",
      lastName: "Martin",
      email: "alice@corp.test",
      role: "employee",
    });
    expect(payload).not.toHaveProperty("password");
    expect(payload).not.toHaveProperty("employee_code");
    expect(payload.firstName).toBe("Alice");
  });
});

describe("toApiUpdatePayload", () => {
  it("n'envoie que les champs définis", () => {
    expect(toApiUpdatePayload({ jobTitle: "Lead" })).toEqual({
      jobTitle: "Lead",
    });
  });
});

describe("userStatusBodySchema", () => {
  it("accepte active, inactive, suspended", () => {
    expect(
      userStatusBodySchema.safeParse({ employmentStatus: "suspended" }).success
    ).toBe(true);
  });
});

describe("uuidParamSchema", () => {
  it("valide un UUID", () => {
    expect(
      uuidParamSchema.safeParse("11111111-2222-4333-8444-555555555555").success
    ).toBe(true);
  });
});