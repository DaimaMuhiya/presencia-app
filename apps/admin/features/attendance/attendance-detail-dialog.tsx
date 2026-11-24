"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  formatAttendanceBusinessDate,
  formatAttendanceDateTime,
} from "@/lib/attendance/attendance-display";
import { attendanceStatusBadgeTone } from "@/lib/attendance/attendance-list-logic";
import { formatAttendanceStatusLabel } from "@/lib/attendance/attendance-status";
import { classifyScanLogsForAttendance } from "@/lib/attendance/classify-scan-logs";
import {
  employeeDisplayCode,
  employeeDisplayName,
  employeeJobTitle,
  type EnrichedAttendance,
} from "@/lib/attendance/enrich-attendance";
import {
  formatScanLogFailureReason,
  formatScanLogMethod,
  formatScanLogOutcome,
  formatScanLogScannedAt,
} from "@/lib/attendance/scan-log-display";
import {
  fetchScanLogsForAttendanceDay,
  mapBffScanLogError,
} from "@/lib/attendance/scan-logs-bff";
import type { AdminAttendance } from "@/lib/attendance/types";
import type { AdminScanLog, ClassifiedScanLogs } from "@/lib/attendance/scan-log-types";
import { BffRequestError } from "@/lib/auth/bff-client";

type AttendanceDetailDialogProps = {
  detail: EnrichedAttendance | null;
  onClose: () => void;
};

export function AttendanceDetailDialog({
  detail,
  onClose,
}: AttendanceDetailDialogProps) {
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [classified, setClassified] = useState<ClassifiedScanLogs | null>(null);
  const scanSeq = useRef(0);

  const loadScanLogs = useCallback(async (row: EnrichedAttendance) => {
    const seq = ++scanSeq.current;
    setScanLoading(true);
    setScanError(null);
    setClassified(null);

    try {
      const logs = await fetchScanLogsForAttendanceDay(
        row.attendance.userId,
        row.attendance.attendanceDate
      );
      if (seq !== scanSeq.current) {
        return;
      }
      setClassified(
        classifyScanLogsForAttendance(logs, row.attendance.id)
      );
    } catch (err) {
      if (seq !== scanSeq.current) {
        return;
      }
      const message =
        err instanceof BffRequestError
          ? mapBffScanLogError(err)
          : "Impossible de charger les journaux de scan.";
      setScanError(message);
    } finally {
      if (seq === scanSeq.current) {
        setScanLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!detail) {
      return;
    }
    startTransition(() => {
      void loadScanLogs(detail);
    });
  }, [detail, loadScanLogs]);

  const handleClose = useCallback(() => {
    scanSeq.current += 1;
    setScanLoading(false);
    setScanError(null);
    setClassified(null);
    onClose();
  }, [onClose]);

  const attendance = detail?.attendance;
  const employee = detail?.employee ?? null;

  return (
    <Dialog
      open={Boolean(detail)}
      onClose={handleClose}
      title="Attendance record"
      size="lg"
    >
      {attendance ? (
        <div className="flex flex-col gap-6">
          <section>
            <h3 className="text-xs font-bold uppercase text-text-secondary">
              Employé
            </h3>
            <dl className="mt-2 grid gap-3 text-sm sm:grid-cols-2">
              {[
                ["Nom", employeeDisplayName(employee)],
                [
                  "Matricule",
                  employeeDisplayCode(employee, attendance.userId),
                ],
                ["Poste", employeeJobTitle(employee) ?? "—"],
                ["Identifiant employé", attendance.userId],
              ].map(([k, v]) => (
                <DetailField key={k} label={k} value={v} />
              ))}
            </dl>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase text-text-secondary">
              Présence
            </h3>
            <dl className="mt-2 grid gap-3 text-sm sm:grid-cols-2">
              <DetailField
                label="Identifiant présence"
                value={attendance.id}
              />
              <DetailField
                label="Date métier"
                value={formatAttendanceBusinessDate(attendance.attendanceDate)}
              />
              <DetailField
                label="Arrivée"
                value={formatAttendanceDateTime(attendance.arrivalAt)}
              />
              <DetailField
                label="Départ"
                value={formatAttendanceDateTime(attendance.departureAt)}
              />
              <DetailStatusField attendance={attendance} />
              <DetailField
                label="Planning"
                value={attendance.scheduleId ?? "—"}
              />
            </dl>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase text-text-secondary">
              Journaux de scan
            </h3>
            <p className="mt-1 text-xs text-text-secondary">
              Les entrées liées à cette présence le sont via{" "}
              <code className="text-[10px]">attendance_id</code>. Les autres
              événements du même jour concernent le même employé mais ne
              constituent pas une preuve directe de ce pointage. L&apos;API
              renvoie au plus 200 entrées : la liste n&apos;est pas exhaustive.
            </p>

            {scanLoading ? (
              <p
                className="mt-3 flex items-center gap-2 text-sm text-text-secondary"
                role="status"
              >
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Chargement des scans…
              </p>
            ) : null}

            {scanError ? (
              <p
                className="mt-3 rounded-md border border-warning-muted bg-warning-muted/30 px-3 py-2 text-sm text-amber-900"
                role="alert"
              >
                {scanError}{" "}
                {detail ? (
                  <button
                    type="button"
                    className="font-semibold underline"
                    onClick={() => void loadScanLogs(detail)}
                  >
                    Réessayer
                  </button>
                ) : null}
              </p>
            ) : null}

            {!scanLoading && !scanError && classified ? (
              <ScanLogSections classified={classified} />
            ) : null}
          </section>
        </div>
      ) : null}
    </Dialog>
  );
}

function DetailStatusField({ attendance }: { attendance: AdminAttendance }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase text-text-secondary">
        Statut
      </dt>
      <dd className="mt-1">
        <StatusBadge
          label={formatAttendanceStatusLabel(
            attendance.status,
            attendance.statusRaw
          )}
          tone={attendanceStatusBadgeTone(attendance.status)}
        />
      </dd>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase text-text-secondary">{label}</dt>
      <dd className="break-all text-text-primary">{value}</dd>
    </div>
  );
}

function ScanLogSections({ classified }: { classified: ClassifiedScanLogs }) {
  const total = classified.linked.length + classified.sameDayOther.length;

  if (total === 0) {
    return (
      <p className="mt-3 text-sm text-text-secondary">
        Aucun journal de scan pour cet employé à cette date.
      </p>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-4">
      {classified.linked.length > 0 ? (
        <ScanLogList
          title="Liés à cette présence"
          logs={classified.linked}
          linkLabel="Lien confirmé"
        />
      ) : null}
      {classified.sameDayOther.length > 0 ? (
        <ScanLogList
          title="Autres scans du même jour"
          logs={classified.sameDayOther}
          linkLabel="Même jour — lien non garanti"
        />
      ) : null}
    </div>
  );
}

function ScanLogList({
  title,
  logs,
  linkLabel,
}: {
  title: string;
  logs: AdminScanLog[];
  linkLabel: string;
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-text-primary">{title}</h4>
      <ul className="mt-2 space-y-2">
        {logs.map((log) => (
          <li
            key={log.id}
            className="rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">
                {formatScanLogScannedAt(log)}
              </span>
              <StatusBadge
                label={formatScanLogOutcome(log)}
                tone={log.isSuccess ? "green" : "rose"}
              />
              <span className="text-xs text-text-secondary">{linkLabel}</span>
            </div>
            <p className="mt-1 text-xs text-text-secondary">
              Méthode : {formatScanLogMethod(log.method)}
            </p>
            {!log.isSuccess ? (
              <p className="mt-1 text-xs text-text-secondary">
                Motif : {formatScanLogFailureReason(log.failureReason)}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}