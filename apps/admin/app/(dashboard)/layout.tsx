import type { ReactNode } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { AppProviders } from "@/components/providers/app-providers";

export default function DashboardGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AppProviders>
      <AdminShell>{children}</AdminShell>
    </AppProviders>
  );
}
