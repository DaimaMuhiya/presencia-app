"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, MoreHorizontal, Plus, X } from "lucide-react";
import {
  ADMIN_NAV_ITEMS,
  ADMIN_TOP_BAR_HEIGHT,
  DEMO_ADMIN_PROFILE,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

export function AdminSidebar({ mobileOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const nav = (
    <>
      <div
        className={cn(
          "flex items-center gap-3 bg-surface px-6",
          ADMIN_TOP_BAR_HEIGHT
        )}
      >
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded bg-linear-to-br from-primary to-primary-hover text-white shadow-sm"
          aria-hidden
        >
          <Clock className="size-4" strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-extrabold tracking-tight text-primary">
            PRESENCIA
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
            Admin Console
          </p>
        </div>
        <button
          type="button"
          className="rounded p-2 text-text-secondary hover:bg-muted lg:hidden"
          onClick={onClose}
          aria-label="Fermer le menu"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="px-4 pt-5 pb-2">
        <button
          type="button"
          disabled
          className="flex w-full items-center justify-center gap-2 rounded bg-linear-to-r from-primary to-primary-hover px-3.5 py-2.5 text-xs font-medium tracking-wide text-white shadow-sm disabled:opacity-100"
          title="Démonstration UI"
        >
          <Plus className="size-3.5" strokeWidth={2.5} />
          New Quick Log
        </button>
      </div>

      <nav
        className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-2"
        aria-label="Navigation principale"
      >
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded px-3.5 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-primary font-semibold text-white shadow-sm shadow-primary/20"
                  : "font-medium text-[#444651] hover:bg-muted"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "size-3.5 shrink-0",
                  isActive ? "text-white" : "text-text-secondary"
                )}
                strokeWidth={2}
                aria-hidden
              />
              <span className={cn(isActive && "text-base")}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <div className="rounded border border-border-soft bg-muted p-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="relative shrink-0">
                <div
                  className="flex size-9 items-center justify-center rounded bg-primary/15 text-xs font-bold text-primary ring-2 ring-white"
                  aria-hidden
                >
                  {DEMO_ADMIN_PROFILE.initials}
                </div>
                <span
                  className="absolute bottom-0 right-0 size-2.5 rounded bg-success ring-2 ring-white"
                  aria-label="En ligne"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-text-primary">
                  {DEMO_ADMIN_PROFILE.name}
                </p>
                <p className="truncate text-[10px] font-medium text-text-secondary">
                  {DEMO_ADMIN_PROFILE.role}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="rounded p-1 text-text-secondary"
              aria-label="Options compte (démo)"
              disabled
            >
              <MoreHorizontal className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-text-primary/40 backdrop-blur-[2px] transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden={!mobileOpen}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-svh w-64 flex-col overflow-hidden bg-surface shadow-[1px_0_12px_rgba(0,35,111,0.03)] transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {nav}
      </aside>
    </>
  );
}
