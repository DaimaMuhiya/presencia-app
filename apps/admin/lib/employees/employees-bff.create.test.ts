import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createEmployee } from "./employees-bff";

describe("createEmployee", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          success: true,
          message: "Compte créé.",
          data: {
            user: {
              id: "11111111-2222-4333-8444-555555555555",
              email: "a@b.com",
              firstName: "A",
              lastName: "B",
              role: "employee",
              employment_status: "active",
              employee_code: "EM-00001",
            },
          },
        }),
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("n’active pas le retry refresh sur POST", async () => {
    await createEmployee({
      firstName: "A",
      lastName: "B",
      email: "a@b.com",
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});