"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { buildWorkforceSnapshot } from "./metrics";
import {
  createSeedAttendance,
  createSeedEmployees,
  createSeedQrCodes,
  DEFAULT_ADMIN_PROFILE,
  DEFAULT_APP_PREFS,
  DEFAULT_ATTENDANCE_RULES,
  DEFAULT_ORGANIZATION,
  DEFAULT_QR_PREFS,
  DEMO_ALERTS,
  DEMO_CHECKPOINTS,
  DEMO_DEPARTMENTS,
  DEMO_EXPORT_HISTORY,
  DEMO_REFERENCE_DATE,
  DEMO_TERMINALS,
} from "./seed";
import type {
  AttendanceRecord,
  DemoSettings,
  Employee,
  ExportHistoryEntry,
  QrCodeRecord,
  Terminal,
} from "@/types/domain";
import { z } from "zod";

export type DashboardFilters = {
  period: "today" | "7d" | "30d" | "custom";
  departmentId: string | "all";
};

type DemoStoreValue = {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  qrCodes: QrCodeRecord[];
  terminals: Terminal[];
  exportHistory: ExportHistoryEntry[];
  settings: DemoSettings;
  dashboardFilters: DashboardFilters;
  workforce: ReturnType<typeof buildWorkforceSnapshot>;
  referenceDate: string;
  setDashboardFilters: (patch: Partial<DashboardFilters>) => void;
  upsertEmployee: (employee: Employee) => void;
  removeEmployee: (id: string) => void;
  addQrCode: (record: QrCodeRecord) => void;
  updateQrCode: (id: string, patch: Partial<QrCodeRecord>) => void;
  updateTerminal: (id: string, patch: Partial<Terminal>) => void;
  updateSettings: (patch: Partial<DemoSettings>) => void;
  addExportHistory: (entry: ExportHistoryEntry) => void;
  alerts: typeof DEMO_ALERTS;
  departments: typeof DEMO_DEPARTMENTS;
  checkpoints: typeof DEMO_CHECKPOINTS;
};

const DemoStoreContext = createContext<DemoStoreValue | null>(null);

const employeeSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  email: z.string().email("E-mail invalide"),
  role: z.string().min(1, "Rôle requis"),
  phone: z.string().min(6, "Téléphone requis"),
});

export function validateEmployeeForm(data: unknown) {
  return employeeSchema.safeParse(data);
}

const initialEmployees = createSeedEmployees();

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [attendanceRecords] = useState(() =>
    createSeedAttendance(initialEmployees)
  );
  const [qrCodes, setQrCodes] = useState(createSeedQrCodes);
  const [terminals, setTerminals] = useState(DEMO_TERMINALS);
  const [exportHistory, setExportHistory] = useState(DEMO_EXPORT_HISTORY);
  const [dashboardFilters, setDashboardFiltersState] = useState<DashboardFilters>({
    period: "today",
    departmentId: "all",
  });
  const [settings, setSettings] = useState<DemoSettings>({
    profile: DEFAULT_ADMIN_PROFILE,
    organization: DEFAULT_ORGANIZATION,
    attendanceRules: DEFAULT_ATTENDANCE_RULES,
    qrTerminal: DEFAULT_QR_PREFS,
    app: DEFAULT_APP_PREFS,
  });

  const filteredEmployees = useMemo(() => {
    if (dashboardFilters.departmentId === "all") return employees;
    return employees.filter((e) => e.departmentId === dashboardFilters.departmentId);
  }, [employees, dashboardFilters.departmentId]);

  const workforce = useMemo(
    () =>
      dashboardFilters.departmentId === "all"
        ? buildWorkforceSnapshot(employees)
        : buildWorkforceSnapshot(filteredEmployees),
    [employees, filteredEmployees, dashboardFilters.departmentId]
  );

  const setDashboardFilters = useCallback((patch: Partial<DashboardFilters>) => {
    setDashboardFiltersState((prev) => ({ ...prev, ...patch }));
  }, []);

  const upsertEmployee = useCallback((employee: Employee) => {
    setEmployees((prev) => {
      const idx = prev.findIndex((e) => e.id === employee.id);
      if (idx === -1) return [...prev, employee];
      const next = [...prev];
      next[idx] = employee;
      return next;
    });
  }, []);

  const removeEmployee = useCallback((id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const addQrCode = useCallback((record: QrCodeRecord) => {
    setQrCodes((prev) => [record, ...prev]);
  }, []);

  const updateQrCode = useCallback((id: string, patch: Partial<QrCodeRecord>) => {
    setQrCodes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...patch } : q))
    );
  }, []);

  const updateTerminal = useCallback((id: string, patch: Partial<Terminal>) => {
    setTerminals((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
    );
  }, []);

  const updateSettings = useCallback((patch: Partial<DemoSettings>) => {
    setSettings((prev) => ({
      ...prev,
      profile: patch.profile ? { ...prev.profile, ...patch.profile } : prev.profile,
      organization: patch.organization
        ? { ...prev.organization, ...patch.organization }
        : prev.organization,
      attendanceRules: patch.attendanceRules
        ? { ...prev.attendanceRules, ...patch.attendanceRules }
        : prev.attendanceRules,
      qrTerminal: patch.qrTerminal
        ? { ...prev.qrTerminal, ...patch.qrTerminal }
        : prev.qrTerminal,
      app: patch.app ? { ...prev.app, ...patch.app } : prev.app,
    }));
  }, []);

  const addExportHistory = useCallback((entry: ExportHistoryEntry) => {
    setExportHistory((prev) => [entry, ...prev]);
  }, []);

  const value = useMemo<DemoStoreValue>(
    () => ({
      employees,
      attendanceRecords,
      qrCodes,
      terminals,
      exportHistory,
      settings,
      dashboardFilters,
      workforce,
      referenceDate: DEMO_REFERENCE_DATE,
      setDashboardFilters,
      upsertEmployee,
      removeEmployee,
      addQrCode,
      updateQrCode,
      updateTerminal,
      updateSettings,
      addExportHistory,
      alerts: DEMO_ALERTS,
      departments: DEMO_DEPARTMENTS,
      checkpoints: DEMO_CHECKPOINTS,
    }),
    [
      employees,
      attendanceRecords,
      qrCodes,
      terminals,
      exportHistory,
      settings,
      dashboardFilters,
      workforce,
      setDashboardFilters,
      upsertEmployee,
      removeEmployee,
      addQrCode,
      updateQrCode,
      updateTerminal,
      updateSettings,
      addExportHistory,
    ]
  );

  return (
    <DemoStoreContext.Provider value={value}>{children}</DemoStoreContext.Provider>
  );
}

export function useDemoStore() {
  const ctx = useContext(DemoStoreContext);
  if (!ctx) {
    throw new Error("useDemoStore must be used within DemoStoreProvider");
  }
  return ctx;
}
