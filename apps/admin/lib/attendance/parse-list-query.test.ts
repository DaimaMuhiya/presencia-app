import { describe, expect, it } from "vitest";

import {
  buildSuperAdminAttendancesApiPath,
  parseAttendanceListQuery,
  parseAttendanceListQueryFromSearchParams,
  searchParamsToAttendanceQueryRaw,
} from "./parse-list-query";

const UUID = "11111111-2222-4333-8444-555555555555";

describe("parseAttendanceListQuery", () => {
  it("accepte une plage from/to valide", () => {
    const result = parseAttendanceListQuery({
      from: "2026-11-01",
      to: "2026-11-30",
    });
    expect(result.ok).toBe(true);
  });

  it("rejette from sans to", () => {
    expect(parseAttendanceListQuery({ from: "2026-11-01" }).ok).toBe(false);
  });

  it("rejette to sans from", () => {
    expect(parseAttendanceListQuery({ to: "2026-11-30" }).ok).toBe(false);
  });

  it("rejette from postérieur à to", () => {
    expect(
      parseAttendanceListQuery({
        from: "2026-11-30",
        to: "2026-11-01",
      }).ok
    ).toBe(false);
  });

  it("rejette from/to combiné à month", () => {
    expect(
      parseAttendanceListQuery({
        from: "2026-11-01",
        to: "2026-11-07",
        month: "2026-11",
      }).ok
    ).toBe(false);
  });

  it("rejette week + date", () => {
    expect(
      parseAttendanceListQuery({
        week: "2026-W46",
        date: "2026-11-12",
      }).ok
    ).toBe(false);
  });

  it("rejette l'absence de période", () => {
    expect(parseAttendanceListQuery({}).ok).toBe(false);
    expect(parseAttendanceListQuery({ user_id: UUID }).ok).toBe(false);
  });

  it("rejette user_id invalide", () => {
    expect(
      parseAttendanceListQuery({
        date: "2026-11-12",
        user_id: "not-a-uuid",
      }).ok
    ).toBe(false);
  });

  it("rejette un statut inconnu", () => {
    expect(
      parseAttendanceListQuery({
        date: "2026-11-12",
        status: "remote",
      }).ok
    ).toBe(false);
  });

  it("rejette une clé inconnue", () => {
    expect(
      parseAttendanceListQuery({
        date: "2026-11-12",
        department_id: "x",
      }).ok
    ).toBe(false);
  });
});

describe("searchParamsToAttendanceQueryRaw", () => {
  it("rejette une clé inconnue dans l'URL", () => {
    const params = new URLSearchParams("date=2026-11-12&foo=bar");
    expect(() => searchParamsToAttendanceQueryRaw(params)).toThrow();
  });
});

describe("parseAttendanceListQueryFromSearchParams", () => {
  it("parse une requête valide", () => {
    const params = new URLSearchParams(
      "from=2026-11-01&to=2026-11-07&status=late"
    );
    const query = parseAttendanceListQueryFromSearchParams(params);
    expect(query.from).toBe("2026-11-01");
    expect(query.status).toBe("late");
  });
});

describe("buildSuperAdminAttendancesApiPath", () => {
  it("transmet les paramètres à l'API", () => {
    expect(
      buildSuperAdminAttendancesApiPath({
        date: "2026-11-12",
        user_id: UUID,
      })
    ).toBe(
      `/super-admin/attendances?date=2026-11-12&user_id=${encodeURIComponent(UUID)}`
    );
  });
});