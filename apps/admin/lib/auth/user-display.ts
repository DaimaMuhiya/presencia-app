import type { ApiUserPublic } from "@/types/api/user";

export function userInitials(user: ApiUserPublic): string {
  const first =
    user.firstName?.trim()?.[0] ?? user.first_name?.trim()?.[0] ?? "";
  const last =
    user.lastName?.trim()?.[0] ?? user.last_name?.trim()?.[0] ?? "";
  const combined = `${first}${last}`.toUpperCase();
  return combined || "SA";
}

export function userDisplayName(user: ApiUserPublic): string {
  return (
    user.name?.trim() ||
    `${user.firstName ?? user.first_name ?? ""} ${user.lastName ?? user.last_name ?? ""}`.trim() ||
    user.email
  );
}