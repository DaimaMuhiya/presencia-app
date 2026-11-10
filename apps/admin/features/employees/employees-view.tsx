"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/providers/toast-provider";
import { paginate, sortBy } from "@/features/demo/metrics";
import { useDemoStore, validateEmployeeForm } from "@/features/demo/demo-store";
import {
  departmentName,
  employeeStatusLabel,
  todayStatusLabel,
} from "@/lib/labels";
import type { DepartmentId, Employee, EmployeeStatus } from "@/types/domain";

export function EmployeesView() {
  const { employees, departments, upsertEmployee, removeEmployee } =
    useDemoStore();
  const { push } = useToast();

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<"name" | "code">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detail, setDetail] = useState<Employee | null>(null);
  const [editing, setEditing] = useState<Employee | null>(null);

  const filtered = useMemo(() => {
    let list = employees;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.employeeCode.toLowerCase().includes(q)
      );
    }
    if (deptFilter !== "all") {
      list = list.filter((e) => e.departmentId === deptFilter);
    }
    if (statusFilter !== "all") {
      list = list.filter((e) => e.status === statusFilter);
    }
    const accessor = (e: Employee) =>
      sortKey === "name"
        ? `${e.lastName}${e.firstName}`
        : e.employeeCode.replace(/\D/g, "");
    return sortBy(list, accessor, sortDir);
  }, [employees, search, deptFilter, statusFilter, sortKey, sortDir]);

  const paged = paginate(filtered, page, 12);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Employee Management"
        description="Directory, status and departmental assignment (démonstration locale)."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4" />
            Add employee
          </Button>
        }
      />

      <div className="flex flex-col gap-3 rounded bg-surface p-4 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, email or ID..."
            className="pl-10"
          />
        </label>
        <Select
          value={deptFilter}
          onChange={(e) => {
            setDeptFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="on_leave">On Leave</option>
          <option value="inactive">Inactive</option>
        </Select>
        <Select
          value={`${sortKey}-${sortDir}`}
          onChange={(e) => {
            const [key, dir] = e.target.value.split("-") as [
              "name" | "code",
              "asc" | "desc",
            ];
            setSortKey(key);
            setSortDir(dir);
          }}
        >
          <option value="name-asc">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
          <option value="code-asc">ID ascending</option>
        </Select>
      </div>

      {paged.total === 0 ? (
        <EmptyState
          title="No employees match"
          description="Adjust filters or add a new employee record."
        />
      ) : (
        <div className="overflow-x-auto rounded bg-surface">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-muted/60 text-xs font-bold uppercase text-text-secondary">
              <tr>
                {["Employee", "Department", "Role", "Status", "Today", "Actions"].map(
                  (h) => (
                    <th key={h} className="px-4 py-3">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {paged.items.map((employee) => (
                <tr key={employee.id} className="border-t border-border/50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-text-primary">
                      {employee.firstName} {employee.lastName}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {employee.employeeCode} · {employee.email}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {departmentName(departments, employee.departmentId)}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{employee.role}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={employeeStatusLabel(employee.status)}
                      tone={
                        employee.status === "active"
                          ? "green"
                          : employee.status === "on_leave"
                            ? "amber"
                            : "neutral"
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={todayStatusLabel(employee.todayStatus)}
                      tone={
                        employee.todayStatus === "late" ||
                        employee.todayStatus === "unexcused_absence"
                          ? "rose"
                          : employee.todayStatus === "remote"
                            ? "blue"
                            : "green"
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <EmployeeRowActions
                      onView={() => setDetail(employee)}
                      onEdit={() => {
                        setEditing(employee);
                        setDialogOpen(true);
                      }}
                      onRemove={() => {
                        if (
                          window.confirm(
                            `Remove ${employee.firstName} ${employee.lastName} from the demo roster?`
                          )
                        ) {
                          removeEmployee(employee.id);
                          push({
                            tone: "info",
                            title: "Employee removed (session only)",
                          });
                        }
                      }}
                    />
                  </td>
                </tr>
              ))}
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

      <EmployeeFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        employee={editing}
        departments={departments}
        onSave={(employee) => {
          upsertEmployee(employee);
          setDialogOpen(false);
          push({
            tone: "success",
            title: editing ? "Employee updated (session)" : "Employee added (session)",
          });
        }}
      />

      <Dialog
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail ? `${detail.firstName} ${detail.lastName}` : ""}
        description={detail?.employeeCode}
        size="lg"
      >
        {detail ? (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {[
              ["Email", detail.email],
              ["Phone", detail.phone],
              ["Department", departmentName(departments, detail.departmentId)],
              ["Role", detail.role],
              ["Hired", detail.hiredAt],
              ["Today", todayStatusLabel(detail.todayStatus)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-bold uppercase text-text-secondary">
                  {label}
                </dt>
                <dd className="mt-0.5 text-text-primary">{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </Dialog>
    </div>
  );
}

function EmployeeRowActions({
  onView,
  onEdit,
  onRemove,
}: {
  onView: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="ghost" size="sm" onClick={onView}>
        View
      </Button>
      <Button variant="secondary" size="sm" onClick={onEdit}>
        Edit
      </Button>
      <Button variant="ghost" size="sm" onClick={onRemove}>
        Remove
      </Button>
    </div>
  );
}

function EmployeeFormDialog({
  open,
  onClose,
  employee,
  departments,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  employee: Employee | null;
  departments: { id: DepartmentId; name: string }[];
  onSave: (employee: Employee) => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={employee ? "Edit employee" : "New employee"}
      description="Changes apply to this browser session only."
    >
      <EmployeeFormBody
        key={employee?.id ?? "new"}
        employee={employee}
        departments={departments}
        onSave={onSave}
        onClose={onClose}
      />
    </Dialog>
  );
}

function EmployeeFormBody({
  employee,
  departments,
  onSave,
  onClose,
}: {
  employee: Employee | null;
  departments: { id: DepartmentId; name: string }[];
  onSave: (employee: Employee) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    firstName: employee?.firstName ?? "",
    lastName: employee?.lastName ?? "",
    email: employee?.email ?? "",
    role: employee?.role ?? "",
    phone: employee?.phone ?? "",
    departmentId: (employee?.departmentId ?? departments[0]?.id) as DepartmentId,
    status: (employee?.status ?? "active") as EmployeeStatus,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const parsed = validateEmployeeForm({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            role: form.role,
            phone: form.phone,
          });
          if (!parsed.success) {
            const fieldErrors: Record<string, string> = {};
            parsed.error.issues.forEach((issue) => {
              const key = String(issue.path[0] ?? "form");
              fieldErrors[key] = issue.message;
            });
            setErrors(fieldErrors);
            return;
          }
          const next: Employee = employee
            ? { ...employee, ...form, departmentId: form.departmentId as DepartmentId }
            : {
                id: `emp-${Date.now()}`,
                employeeCode: `#EMP-${2000 + Math.floor(Math.random() * 800)}`,
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                role: form.role,
                phone: form.phone,
                departmentId: form.departmentId as DepartmentId,
                status: form.status,
                todayStatus: "on_time",
                hiredAt: new Date().toISOString().slice(0, 10),
              };
          onSave(next);
        }}
      >
        <label className="block text-xs font-semibold text-text-secondary">
          Department
          <Select
            className="mt-1 w-full"
            value={form.departmentId}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                departmentId: e.target.value as DepartmentId,
              }))
            }
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="First name"
            value={form.firstName}
            error={errors.firstName}
            onChange={(v) => setForm((f) => ({ ...f, firstName: v }))}
          />
          <Field
            label="Last name"
            value={form.lastName}
            error={errors.lastName}
            onChange={(v) => setForm((f) => ({ ...f, lastName: v }))}
          />
          <Field
            label="Email"
            value={form.email}
            error={errors.email}
            onChange={(v) => setForm((f) => ({ ...f, email: v }))}
          />
          <Field
            label="Phone"
            value={form.phone}
            error={errors.phone}
            onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
          />
          <Field
            label="Role"
            value={form.role}
            error={errors.role}
            onChange={(v) => setForm((f) => ({ ...f, role: v }))}
          />
          <label className="block text-xs font-semibold text-text-secondary">
            HR status
            <Select
              className="mt-1 w-full"
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value as EmployeeStatus }))
              }
            >
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="inactive">Inactive</option>
            </Select>
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save (local)</Button>
        </div>
      </form>
  );
}

function Field({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs font-semibold text-text-secondary">
      {label}
      <Input
        className="mt-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error ? <span className="text-[11px] text-danger">{error}</span> : null}
    </label>
  );
}
