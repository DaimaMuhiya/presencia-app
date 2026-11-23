import { describe, expect, it } from "vitest";

import type { ApiUserPublic } from "@/types/api/user";

import { mapApiUserToAdminEmployee, mapApiUsersToAdminEmployees } from "./map-user";

const sample: ApiUserPublic = {
  id: "11111111-2222-4333-8444-555555555555",
  email: "marie@example.com",
  work_email: "marie@example.com",
  firstName: "Marie",
  lastName: "Dupont",
  employee_code: "EM-00001",
  role: "employee",
  employment_status: "active",
  job_title: "Analyst",
  phone: "+33600000000",
  joining_date: "2024-01-15",
};

describe("mapApiUserToAdminEmployee", () => {
  it("normalise les champs principaux", () => {
    const row = mapApiUserToAdminEmployee(sample);
    expect(row.id).toBe(sample.id);
    expect(row.email).toBe("marie@example.com");
    expect(row.employeeCode).toBe("EM-00001");
    expect(row.employmentStatus).toBe("active");
    expect(row.jobTitle).toBe("Analyst");
  });

  it("gère les champs partiels et statut inconnu", () => {
    const partial: ApiUserPublic = {
      id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      email: "x@y.com",
      firstName: "X",
      lastName: "Y",
      role: "admin",
      employment_status: "legacy_value",
    };
    const row = mapApiUserToAdminEmployee(partial);
    expect(row.employeeCode).toBe("—");
    expect(row.employmentStatus).toBe("unknown");
    expect(row.employmentStatusRaw).toBe("legacy_value");
    expect(row.role).toBe("admin");
  });

  it("mappe une liste", () => {
    expect(mapApiUsersToAdminEmployees([sample])).toHaveLength(1);
  });
});