import type { ReactNode } from "react";
import { AdminShell } from "@/components/layout/admin-shell";

export default function DashboardGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
