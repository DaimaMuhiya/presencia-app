import { describe, expect, it } from "vitest";

import type { AdminEmployee } from "@/lib/employees/types";

import type { AdminAttendance } from "./types";

import { buildAttendanceListQuery } from "./attendance-list-logic";
import {
  employeeDisplayCode,
  employeeDisplayName,
  employeeJobTitle,
  enrichAttendances,
  filterEnrichedAttendances,
  indexEmployeesById,
} from "./enrich-attendance";

const USER_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const ATT_ID = "11111111-2222-4333-8444-555555555555";

const attendance: AdminAttendance = {
  id: ATT_ID,
  userId: USER_ID,
  scheduleId: null,
  attendanceDate: "2026-11-12",
  arrivalAt: null,
  departureAt: null,
  status: "on_time",
};

const employeeFull: AdminEmployee = {
  id: USER_ID,
  firstName: "Marie",
  lastName: "Dupont",
  email: "marie@corp.test",
  employeeCode: "EM-00001",
  role: "employee",
  employmentStatus: "active",
  jobTitle: "Analyste",
  phone: null,
  joiningDate: null,
  avatarUrl: null,
};

const employeeNoTitle: AdminEmployee = {
  ...employeeFull,
  jobTitle: null,
};

const employeeNoCode: AdminEmployee = {
  ...employeeFull,
  employeeCode: "—",
};

describe("enrichAttendances", () => {
  it("jointe présence et employé par id", () => {
    const map = indexEmployeesById([employeeFull]);
    const enriched = enrichAttendances([attendance], map);
    expect(enriched).toHaveLength(1);
    expect(enriched[0]?.employee?.firstName).toBe("Marie");
  });

  it("signale un employé introuvable", () => {
    const enriched = enrichAttendances([attendance], new Map());
    expect(enriched[0]?.employee).toBeNull();
    expect(employeeDisplayName(enriched[0]?.employee ?? null)).toBe(
      "Employé introuvable"
    );
    expect(employeeDisplayCode(enriched[0]?.employee ?? null, USER_ID)).toBe(
      USER_ID
    );
  });

  it("gère matricule et poste absents", () => {
    expect(employeeDisplayCode(employeeNoCode, USER_ID)).toBe(USER_ID);
    expect(employeeJobTitle(employeeNoTitle)).toBeNull();
    expect(employeeJobTitle(employeeFull)).toBe("Analyste");
  });
});

describe("filterEnrichedAttendances", () => {
  const map = indexEmployeesById([employeeFull]);
  const rows = enrichAttendances([attendance], map);

  it("recherche par prénom, nom, nom complet et matricule", () => {
    expect(filterEnrichedAttendances(rows, "marie")).toHaveLength(1);
    expect(filterEnrichedAttendances(rows, "dupont")).toHaveLength(1);
    expect(filterEnrichedAttendances(rows, "marie dupont")).toHaveLength(1);
    expect(filterEnrichedAttendances(rows, "EM-00001")).toHaveLength(1);
  });

  it("recherche par uuid présence ou employé", () => {
    expect(filterEnrichedAttendances(rows, ATT_ID.slice(0, 8))).toHaveLength(1);
    expect(filterEnrichedAttendances(rows, USER_ID.slice(0, 8))).toHaveLength(1);
    expect(filterEnrichedAttendances(rows, "introuvable")).toHaveLength(0);
  });
});

describe("buildAttendanceListQuery avec employé", () => {
  it("combine période, statut et user_id", () => {
    expect(
      buildAttendanceListQuery(
        "2026-11-01",
        "2026-11-07",
        "late",
        USER_ID
      )
    ).toEqual({
      from: "2026-11-01",
      to: "2026-11-07",
      status: "late",
      user_id: USER_ID,
    });
  });
});