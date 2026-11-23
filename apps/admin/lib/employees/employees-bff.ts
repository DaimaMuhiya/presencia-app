import { bffFetch, BffRequestError } from "@/lib/auth/bff-client";

import { mapApiUserToAdminEmployee, mapApiUsersToAdminEmployees } from "./map-user";
import type { AdminEmployee, ApiUserItemData, ApiUserListData } from "./types";
import type { UserCreateBody, UserStatusBody, UserUpdateBody } from "./schemas";

const BASE = "/api/super-admin/users";

export async function fetchEmployeesList(): Promise<AdminEmployee[]> {
  const res = await bffFetch<ApiUserListData>(BASE, { method: "GET" });
  const users = res.data?.users ?? [];
  return mapApiUsersToAdminEmployees(users);
}

export async function fetchEmployeeById(id: string): Promise<AdminEmployee> {
  const res = await bffFetch<ApiUserItemData>(`${BASE}/${id}`, {
    method: "GET",
  });
  const user = res.data?.user;
  if (!user) {
    throw new BffRequestError(502, {
      success: false,
      message: "Réponse employé incomplète.",
    });
  }
  return mapApiUserToAdminEmployee(user);
}

export async function createEmployee(
  body: UserCreateBody
): Promise<{ employee: AdminEmployee; message: string }> {
  const res = await bffFetch<ApiUserItemData>(BASE, {
    method: "POST",
    body,
    skipRefreshRetry: true,
  });
  const user = res.data?.user;
  if (!user) {
    throw new BffRequestError(502, {
      success: false,
      message: "Réponse de création incomplète.",
    });
  }
  return {
    employee: mapApiUserToAdminEmployee(user),
    message: res.message,
  };
}

export async function updateEmployee(
  id: string,
  body: UserUpdateBody
): Promise<{ employee: AdminEmployee; message: string }> {
  const res = await bffFetch<ApiUserItemData>(`${BASE}/${id}`, {
    method: "PUT",
    body,
  });
  const user = res.data?.user;
  if (!user) {
    throw new BffRequestError(502, {
      success: false,
      message: "Réponse de mise à jour incomplète.",
    });
  }
  return {
    employee: mapApiUserToAdminEmployee(user),
    message: res.message,
  };
}

export async function updateEmployeeStatus(
  id: string,
  body: UserStatusBody
): Promise<{ employee: AdminEmployee; message: string }> {
  const res = await bffFetch<ApiUserItemData>(`${BASE}/${id}/status`, {
    method: "PUT",
    body,
  });
  const user = res.data?.user;
  if (!user) {
    throw new BffRequestError(502, {
      success: false,
      message: "Réponse de statut incomplète.",
    });
  }
  return {
    employee: mapApiUserToAdminEmployee(user),
    message: res.message,
  };
}

export async function deleteEmployee(id: string): Promise<string> {
  const res = await bffFetch<undefined>(`${BASE}/${id}`, {
    method: "DELETE",
  });
  return res.message;
}

export function mapBffEmployeeError(err: BffRequestError): string {
  if (err.status === 401) {
    return "Session expirée. Reconnectez-vous.";
  }
  if (err.status === 403) {
    return err.message || "Action non autorisée.";
  }
  if (err.status === 404) {
    return "Compte introuvable.";
  }
  if (err.status === 422) {
    const fieldMessages = err.body.errors
      ? Object.values(err.body.errors)
          .flat()
          .filter(Boolean)
          .join(" ")
      : "";
    return fieldMessages || err.message;
  }
  if (err.status === 429) {
    return "Trop de requêtes. Patientez puis réessayez.";
  }
  if (err.status >= 500) {
    return err.message || "Serveur indisponible. Réessayez plus tard.";
  }
  return err.message;
}