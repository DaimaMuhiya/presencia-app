"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  startTransition,
} from "react";
import { Loader2, Plus, Search } from "lucide-react";
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
import { BffRequestError } from "@/lib/auth/bff-client";
import { mapCreateEmployeeError } from "@/lib/employees/create-errors";
import {
  createEmployee,
  deleteEmployee,
  fetchEmployeeById,
  fetchEmployeesList,
  mapBffEmployeeError,
  updateEmployee,
  updateEmployeeStatus,
} from "@/lib/employees/employees-bff";
import {
  formatEmploymentStatusLabel,
  isKnownEmploymentStatus,
} from "@/lib/employees/employment-status";
import {
  userCreateBodySchema,
  userUpdateBodySchema,
  type UserCreateBody,
  type UserUpdateBody,
} from "@/lib/employees/schemas";
import type { AdminEmployee, EmployeeRole, EmploymentStatus } from "@/lib/employees/types";

export function EmployeesView() {
  const { push } = useToast();
  const [employees, setEmployees] = useState<AdminEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mutationBusy, setMutationBusy] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<"name" | "code">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<AdminEmployee | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminEmployee | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const list = await fetchEmployeesList();
      setEmployees(list);
    } catch (err) {
      const message =
        err instanceof BffRequestError
          ? mapBffEmployeeError(err)
          : "Impossible de charger les employés.";
      setLoadError(message);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      void reload();
    });
  }, [reload]);

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
    if (roleFilter !== "all") {
      list = list.filter((e) => e.role === roleFilter);
    }
    if (statusFilter !== "all") {
      list = list.filter((e) => e.employmentStatus === statusFilter);
    }
    const accessor = (e: AdminEmployee) =>
      sortKey === "name"
        ? `${e.lastName}${e.firstName}`
        : e.employeeCode.replace(/\D/g, "");
    return sortBy(list, accessor, sortDir);
  }, [employees, search, roleFilter, statusFilter, sortKey, sortDir]);

  const paged = paginate(filtered, page, 12);

  async function handleDelete(employee: AdminEmployee) {
    if (
      !window.confirm(
        `Supprimer le compte de ${employee.firstName} ${employee.lastName} ?`
      )
    ) {
      return;
    }
    setMutationBusy(true);
    try {
      const message = await deleteEmployee(employee.id);
      await reload();
      push({ tone: "success", title: message || "Compte supprimé." });
    } catch (err) {
      push({
        tone: "error",
        title:
          err instanceof BffRequestError
            ? mapBffEmployeeError(err)
            : "Suppression impossible.",
      });
    } finally {
      setMutationBusy(false);
    }
  }

  async function openEmployeeDetail(employee: AdminEmployee) {
    setDetailOpen(true);
    setDetail(null);
    setDetailLoading(true);
    setDetailError(null);
    try {
      const fresh = await fetchEmployeeById(employee.id);
      setDetail(fresh);
    } catch (err) {
      setDetailError(
        err instanceof BffRequestError
          ? mapBffEmployeeError(err)
          : "Impossible de charger la fiche employé."
      );
    } finally {
      setDetailLoading(false);
    }
  }

  function closeEmployeeDetail() {
    setDetailOpen(false);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(false);
  }

  async function handleToggleStatus(employee: AdminEmployee) {
    if (!isKnownEmploymentStatus(employee.employmentStatus)) {
      return;
    }
    const next: EmploymentStatus =
      employee.employmentStatus === "active" ? "inactive" : "active";
    setMutationBusy(true);
    try {
      const { message } = await updateEmployeeStatus(employee.id, {
        employmentStatus: next,
      });
      await reload();
      push({ tone: "success", title: message || "Statut mis à jour." });
    } catch (err) {
      push({
        tone: "error",
        title:
          err instanceof BffRequestError
            ? mapBffEmployeeError(err)
            : "Mise à jour du statut impossible.",
      });
    } finally {
      setMutationBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Employee Management"
        description="Directory and account lifecycle via the Presencia API."
        actions={
          <Button
            disabled={loading || mutationBusy}
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

      {loadError ? (
        <p
          className="rounded-md border border-danger-muted bg-danger-muted/40 px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {loadError}{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => void reload()}
          >
            Réessayer
          </button>
        </p>
      ) : null}

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
            disabled={loading}
          />
        </label>
        <Select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          disabled={loading}
        >
          <option value="all">All roles</option>
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super admin</option>
        </Select>
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          disabled={loading}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
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
          disabled={loading}
        >
          <option value="name-asc">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
          <option value="code-asc">ID ascending</option>
        </Select>
      </div>

      {loading ? (
        <div
          className="flex items-center justify-center gap-2 rounded bg-surface py-16 text-sm text-text-secondary"
          role="status"
        >
          <Loader2 className="size-5 animate-spin" aria-hidden />
          Loading employees…
        </div>
      ) : paged.total === 0 ? (
        <EmptyState
          title="No employees match"
          description="Adjust filters or add a new employee record."
        />
      ) : (
        <div className="overflow-x-auto rounded bg-surface">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-muted/60 text-xs font-bold uppercase text-text-secondary">
              <tr>
                {["Employee", "Position", "Role", "Status", "Actions"].map(
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
                    {employee.jobTitle ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {employee.role}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={formatEmploymentStatusLabel(
                        employee.employmentStatus,
                        employee.employmentStatusRaw
                      )}
                      tone={
                        employee.employmentStatus === "active"
                          ? "green"
                          : employee.employmentStatus === "suspended"
                            ? "amber"
                            : employee.employmentStatus === "unknown"
                              ? "rose"
                              : "neutral"
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <EmployeeRowActions
                      disabled={mutationBusy}
                      isActive={employee.employmentStatus === "active"}
                      canToggleStatus={isKnownEmploymentStatus(
                        employee.employmentStatus
                      )}
                      onView={() => void openEmployeeDetail(employee)}
                      onEdit={() => {
                        setEditing(employee);
                        setDialogOpen(true);
                      }}
                      onToggleStatus={() => void handleToggleStatus(employee)}
                      onRemove={() => void handleDelete(employee)}
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
        busy={mutationBusy}
        onClose={() => setDialogOpen(false)}
        employee={editing}
        onSave={async (payload, isEdit) => {
          setMutationBusy(true);
          try {
            if (isEdit && editing) {
              const { message } = await updateEmployee(editing.id, payload);
              push({ tone: "success", title: message || "Compte modifié." });
            } else {
              const { message } = await createEmployee(payload as UserCreateBody);
              push({
                tone: "success",
                title:
                  message ||
                  "Compte créé. Les identifiants sont envoyés par e-mail.",
              });
            }
            setDialogOpen(false);
            await reload();
          } catch (err) {
            const title =
              err instanceof BffRequestError
                ? isEdit
                  ? mapBffEmployeeError(err)
                  : mapCreateEmployeeError(err)
                : isEdit
                  ? "Enregistrement impossible."
                  : mapCreateEmployeeError(
                      new BffRequestError(503, {
                        success: false,
                        message: "Connexion temporairement indisponible.",
                      })
                    );
            push({ tone: "error", title });
            if (!isEdit && err instanceof BffRequestError) {
              await reload();
            }
          } finally {
            setMutationBusy(false);
          }
        }}
      />

      <Dialog
        open={detailOpen}
        onClose={closeEmployeeDetail}
        title={
          detail
            ? `${detail.firstName} ${detail.lastName}`
            : "Employee details"
        }
        description={detail?.employeeCode}
        size="lg"
      >
        {detailLoading ? (
          <div
            className="flex items-center justify-center gap-2 py-10 text-sm text-text-secondary"
            role="status"
          >
            <Loader2 className="size-5 animate-spin" aria-hidden />
            Loading profile…
          </div>
        ) : detailError ? (
          <p className="rounded-md border border-danger-muted bg-danger-muted/40 px-3 py-2 text-sm text-danger">
            {detailError}
          </p>
        ) : detail ? (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {[
              ["Email", detail.email],
              ["Phone", detail.phone ?? "—"],
              ["Position", detail.jobTitle ?? "—"],
              ["Role", detail.role],
              [
                "Status",
                formatEmploymentStatusLabel(
                  detail.employmentStatus,
                  detail.employmentStatusRaw
                ),
              ],
              ["Joined", detail.joiningDate ?? "—"],
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
  disabled,
  isActive,
  canToggleStatus,
  onView,
  onEdit,
  onToggleStatus,
  onRemove,
}: {
  disabled: boolean;
  isActive: boolean;
  canToggleStatus: boolean;
  onView: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="ghost" size="sm" disabled={disabled} onClick={onView}>
        View
      </Button>
      <Button variant="secondary" size="sm" disabled={disabled} onClick={onEdit}>
        Edit
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={disabled || !canToggleStatus}
        onClick={onToggleStatus}
      >
        {isActive ? "Deactivate" : "Activate"}
      </Button>
      <Button variant="ghost" size="sm" disabled={disabled} onClick={onRemove}>
        Delete
      </Button>
    </div>
  );
}

function EmployeeFormDialog({
  open,
  busy,
  onClose,
  employee,
  onSave,
}: {
  open: boolean;
  busy: boolean;
  onClose: () => void;
  employee: AdminEmployee | null;
  onSave: (payload: UserCreateBody | UserUpdateBody, isEdit: boolean) => Promise<void>;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={employee ? "Edit employee" : "New employee"}
      description={
        employee
          ? "Update account fields. Matricule is assigned by the system."
          : "Matricule and initial password are generated and sent by e-mail."
      }
    >
      <EmployeeFormBody
        key={employee?.id ?? "new"}
        employee={employee}
        busy={busy}
        onSave={onSave}
        onClose={onClose}
      />
    </Dialog>
  );
}

function EmployeeFormBody({
  employee,
  busy,
  onSave,
  onClose,
}: {
  employee: AdminEmployee | null;
  busy: boolean;
  onSave: (payload: UserCreateBody | UserUpdateBody, isEdit: boolean) => Promise<void>;
  onClose: () => void;
}) {
  const isEdit = Boolean(employee);
  const [form, setForm] = useState({
    firstName: employee?.firstName ?? "",
    lastName: employee?.lastName ?? "",
    email: employee?.email ?? "",
    role: (employee?.role ?? "employee") as EmployeeRole,
    phone: employee?.phone ?? "",
    jobTitle: employee?.jobTitle ?? "",
    joiningDate: employee?.joiningDate ?? "",
    employmentStatus: (
      employee?.employmentStatus &&
      isKnownEmploymentStatus(employee.employmentStatus)
        ? employee.employmentStatus
        : "active"
    ) as EmploymentStatus,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const payload = {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone || undefined,
          role: form.role,
          jobTitle: form.jobTitle || undefined,
          joiningDate: form.joiningDate || undefined,
          employmentStatus: form.employmentStatus,
        };
        const schema = isEdit ? userUpdateBodySchema : userCreateBodySchema;
        const parsed = schema.safeParse(payload);
        if (!parsed.success) {
          const fieldErrors: Record<string, string> = {};
          parsed.error.issues.forEach((issue) => {
            const key = String(issue.path[0] ?? "form");
            fieldErrors[key] = issue.message;
          });
          setErrors(fieldErrors);
          return;
        }
        setErrors({});
        void onSave(parsed.data, isEdit);
      }}
    >
      {isEdit && employee ? (
        <p className="rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-xs text-text-secondary">
          Matricule : <strong>{employee.employeeCode}</strong>
        </p>
      ) : null}
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
          label="Work email"
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
          label="Job title"
          value={form.jobTitle}
          error={errors.jobTitle}
          onChange={(v) => setForm((f) => ({ ...f, jobTitle: v }))}
        />
        <Field
          label="Joining date"
          type="date"
          value={form.joiningDate}
          error={errors.joiningDate}
          onChange={(v) => setForm((f) => ({ ...f, joiningDate: v }))}
        />
        <label className="block text-xs font-semibold text-text-secondary">
          Role
          <Select
            className="mt-1 w-full"
            value={form.role}
            onChange={(e) =>
              setForm((f) => ({ ...f, role: e.target.value as EmployeeRole }))
            }
          >
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super admin</option>
          </Select>
        </label>
        <label className="block text-xs font-semibold text-text-secondary">
          Status
          <Select
            className="mt-1 w-full"
            value={form.employmentStatus}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                employmentStatus: e.target.value as EmploymentStatus,
              }))
            }
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </Select>
        </label>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" type="button" disabled={busy} onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Saving…
            </>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  error,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs font-semibold text-text-secondary">
      {label}
      <Input
        type={type}
        className="mt-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error ? <span className="text-[11px] text-danger">{error}</span> : null}
    </label>
  );
}