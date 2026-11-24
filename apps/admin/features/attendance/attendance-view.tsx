"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Loader2, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { AttendanceDetailDialog } from "@/features/attendance/attendance-detail-dialog";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  fetchAttendanceList,
  mapBffAttendanceError,
} from "@/lib/attendance/attendance-bff";
import {
  formatAttendanceBusinessDate,
  formatAttendanceClockTime,
} from "@/lib/attendance/attendance-display";
import {
  ATTENDANCE_PAGE_SIZE,
  attendanceStatusBadgeTone,
  buildAttendanceListQuery,
  defaultAttendancePeriod,
  paginateList,
  resolveAttendanceEmptyState,
  validateAttendancePeriod,
  type AttendanceStatusFilter,
} from "@/lib/attendance/attendance-list-logic";
import {
  employeeDisplayCode,
  employeeDisplayName,
  employeeJobTitle,
  enrichAttendances,
  filterEnrichedAttendances,
  indexEmployeesById,
  sortEnrichedAttendances,
  type EnrichedAttendance,
} from "@/lib/attendance/enrich-attendance";
import { formatAttendanceStatusLabel } from "@/lib/attendance/attendance-status";
import {
  fetchEmployeesList,
  mapBffEmployeeError,
} from "@/lib/employees/employees-bff";
import type { AdminEmployee } from "@/lib/employees/types";
import { BffRequestError } from "@/lib/auth/bff-client";

const defaultPeriod = defaultAttendancePeriod();

export function AttendanceView() {
  const [rows, setRows] = useState<EnrichedAttendance["attendance"][]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [employees, setEmployees] = useState<AdminEmployee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [employeesError, setEmployeesError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AttendanceStatusFilter>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState(defaultPeriod.from);
  const [dateTo, setDateTo] = useState(defaultPeriod.to);
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<EnrichedAttendance | null>(null);

  const fetchSeq = useRef(0);
  const employeesFetchStarted = useRef(false);

  const periodError = useMemo(
    () => validateAttendancePeriod(dateFrom, dateTo),
    [dateFrom, dateTo]
  );

  const listQuery = useMemo(
    () =>
      buildAttendanceListQuery(
        dateFrom,
        dateTo,
        statusFilter,
        employeeFilter
      ),
    [dateFrom, dateTo, statusFilter, employeeFilter]
  );

  const employeesById = useMemo(
    () => indexEmployeesById(employees),
    [employees]
  );

  const employeeOptions = useMemo(() => {
    return [...employees].sort((a, b) =>
      `${a.lastName}${a.firstName}`.localeCompare(
        `${b.lastName}${b.firstName}`,
        "fr"
      )
    );
  }, [employees]);

  const loadEmployees = useCallback(async () => {
    setEmployeesLoading(true);
    setEmployeesError(null);
    try {
      const list = await fetchEmployeesList();
      setEmployees(list);
    } catch (err) {
      const message =
        err instanceof BffRequestError
          ? mapBffEmployeeError(err)
          : "Impossible de charger les employés.";
      setEmployeesError(message);
      setEmployees([]);
    } finally {
      setEmployeesLoading(false);
    }
  }, []);

  const reloadAttendances = useCallback(async () => {
    if (!listQuery) {
      setLoading(false);
      return;
    }

    const seq = ++fetchSeq.current;
    setLoading(true);
    setLoadError(null);

    try {
      const data = await fetchAttendanceList(listQuery);
      if (seq !== fetchSeq.current) {
        return;
      }
      setRows(data.attendances);
    } catch (err) {
      if (seq !== fetchSeq.current) {
        return;
      }
      const message =
        err instanceof BffRequestError
          ? mapBffAttendanceError(err)
          : "Impossible de charger les présences.";
      setLoadError(message);
      setRows([]);
    } finally {
      if (seq === fetchSeq.current) {
        setLoading(false);
      }
    }
  }, [listQuery]);

  useEffect(() => {
    if (employeesFetchStarted.current) {
      return;
    }
    employeesFetchStarted.current = true;
    startTransition(() => {
      void loadEmployees();
    });
  }, [loadEmployees]);

  useEffect(() => {
    if (!listQuery) {
      return;
    }
    startTransition(() => {
      void reloadAttendances();
    });
  }, [listQuery, reloadAttendances]);

  const enrichedRows = useMemo(
    () => enrichAttendances(rows, employeesById),
    [rows, employeesById]
  );

  const displayed = useMemo(() => {
    const searched = filterEnrichedAttendances(enrichedRows, search);
    return sortEnrichedAttendances(searched);
  }, [enrichedRows, search]);

  const paged = paginateList(displayed, page, ATTENDANCE_PAGE_SIZE);
  const emptyKind = resolveAttendanceEmptyState(
    enrichedRows.length,
    displayed.length,
    search
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Attendance Logs"
        description="Présences chargées via l'API Presencia (période obligatoire)."
      />

      {loadError ? (
        <p
          className="rounded-md border border-danger-muted bg-danger-muted/40 px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {loadError}{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => void reloadAttendances()}
          >
            Réessayer
          </button>
        </p>
      ) : null}

      {employeesError ? (
        <p
          className="rounded-md border border-warning-muted bg-warning-muted/30 px-3 py-2 text-sm text-amber-900"
          role="alert"
        >
          {employeesError} Les présences restent consultables avec les
          identifiants uniquement.{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => void loadEmployees()}
          >
            Réessayer
          </button>
        </p>
      ) : null}

      {periodError ? (
        <p
          className="rounded-md border border-warning-muted bg-warning-muted/30 px-3 py-2 text-sm text-amber-900"
          role="status"
        >
          {periodError}
        </p>
      ) : null}

      <div className="grid gap-3 rounded bg-surface p-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
          <Input
            className="pl-10"
            placeholder="Rechercher nom, matricule, ID…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            disabled={loading}
          />
        </label>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            setPage(1);
          }}
          disabled={loading}
          aria-label="Date de début"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            setPage(1);
          }}
          disabled={loading}
          aria-label="Date de fin"
        />
        <Select
          value={employeeFilter}
          onChange={(e) => {
            setEmployeeFilter(e.target.value);
            setPage(1);
          }}
          disabled={loading || employeesLoading}
        >
          <option value="all">Tous les employés</option>
          {employeeOptions.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.firstName} {employee.lastName} — {employee.employeeCode}
            </option>
          ))}
        </Select>
        <Select
          className="md:col-span-2 lg:col-span-1"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as AttendanceStatusFilter);
            setPage(1);
          }}
          disabled={loading}
        >
          <option value="all">Tous les statuts</option>
          <option value="on_time">À l&apos;heure</option>
          <option value="late">En retard</option>
          <option value="absent">Absent</option>
          <option value="exception">Exception</option>
        </Select>
      </div>

      {loading ? (
        <AttendanceLoadingPanel />
      ) : periodError ? (
        <EmptyState
          title="Période invalide"
          description="Corrigez les dates pour charger les présences."
        />
      ) : paged.total === 0 ? (
        <EmptyState
          title={
            emptyKind === "search"
              ? "Aucun résultat"
              : "Aucune présence"
          }
          description={
            emptyKind === "search"
              ? "Modifiez la recherche ou élargissez les filtres."
              : "Aucune ligne pour cette période et ces filtres. Cela ne signifie pas que tous les employés sont absents."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded bg-surface">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-muted/60 text-xs font-bold uppercase text-text-secondary">
              <tr>
                {[
                  "Date",
                  "Employee",
                  "Check-in",
                  "Check-out",
                  "Status",
                  "",
                ].map((h) => (
                  <th key={h || "actions"} className="px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.items.map(({ attendance, employee }) => {
                const jobTitle = employeeJobTitle(employee);
                return (
                  <tr key={attendance.id} className="border-t border-border/50">
                    <td className="px-4 py-3 font-medium">
                      {formatAttendanceBusinessDate(attendance.attendanceDate)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">
                        {employeeDisplayName(employee)}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {employeeDisplayCode(employee, attendance.userId)}
                      </p>
                      {jobTitle ? (
                        <p className="text-xs text-text-secondary">{jobTitle}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      {formatAttendanceClockTime(attendance.arrivalAt)}
                    </td>
                    <td className="px-4 py-3">
                      {formatAttendanceClockTime(attendance.departureAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={formatAttendanceStatusLabel(
                          attendance.status,
                          attendance.statusRaw
                        )}
                        tone={attendanceStatusBadgeTone(attendance.status)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="text-xs font-bold text-primary"
                        onClick={() =>
                          setDetail({ attendance, employee: employee ?? null })
                        }
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="border-t border-border/50 p-4">
            <Pagination
              page={paged.page}
              pages={paged.pages}
              from={paged.from}
              to={paged.to}
              total={paged.total}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      <AttendanceDetailDialog detail={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

function AttendanceLoadingPanel() {
  return (
    <div
      className="flex items-center justify-center gap-2 rounded bg-surface py-16 text-sm text-text-secondary"
      role="status"
    >
      <Loader2 className="size-5 animate-spin" aria-hidden />
      Chargement des présences…
    </div>
  );
}