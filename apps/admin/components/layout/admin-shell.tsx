"use client";

import { useState, type ReactNode } from "react";
import { ADMIN_TOP_BAR_OFFSET } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { AdminContentInset } from "./admin-content-inset";
import { AdminHeader } from "./admin-header";
import { AdminSidebar } from "./admin-sidebar";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className={cn("flex min-w-0 flex-1 flex-col lg:pl-64", ADMIN_TOP_BAR_OFFSET)}>
        <AdminHeader onMenuClick={() => setMobileOpen(true)} />
        <AdminContentInset as="main" className="flex-1 pb-8 pt-6">
          {children}
        </AdminContentInset>
      </div>
    </div>
  );
}
