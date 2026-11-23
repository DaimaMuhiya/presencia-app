import { describe, expect, it } from "vitest";

import { parseMePayload } from "./session-policy";

describe("parseMePayload", () => {
  it("accepte un super_admin", () => {
    const user = parseMePayload({
      success: true,
      data: {
        user: {
          id: "1",
          email: "a@b.cd",
          role: "super_admin",
          firstName: "A",
          lastName: "B",
        },
      },
    });
    expect(user?.role).toBe("super_admin");
  });

  it("rejette un employé", () => {
    expect(
      parseMePayload({
        success: true,
        data: {
          user: {
            id: "2",
            email: "e@b.cd",
            role: "employee",
            firstName: "E",
            lastName: "M",
          },
        },
      })
    ).toBeNull();
  });
});