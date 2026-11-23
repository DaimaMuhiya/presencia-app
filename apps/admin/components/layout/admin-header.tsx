"use client";

import { usePathname } from "next/navigation";
import { Bell, CircleHelp, LogOut, Menu, Search } from "lucide-react";
import { useAuth } from "@/features/auth/auth-provider";
import {
  ADMIN_TOP_BAR_HEIGHT,
  DEMO_ADMIN_PROFILE,
  PAGE_BREADCRUMBS,
  PAGE_TITLES,
} from "@/lib/constants";
import { userInitials } from "@/lib/auth/user-display";
import { cn } from "@/lib/utils";
import { AdminContentInset } from "./admin-content-inset";

type AdminHeaderProps = {
  onMenuClick: () => void;
};

function matchPath(pathname: string) {
  return Object.keys(PAGE_TITLES).find(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const profileInitials = user
    ? userInitials(user)
    : DEMO_ADMIN_PROFILE.initials;
  const matchedKey = matchPath(pathname);
  const title = (matchedKey && PAGE_TITLES[matchedKey]) ?? "Presencia Admin";
  const crumbs: string[] = matchedKey
    ? (PAGE_BREADCRUMBS[matchedKey] ?? ["Home", title])
    : ["Home", title];

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-30 bg-surface/95 backdrop-blur-md lg:left-64",
        ADMIN_TOP_BAR_HEIGHT
      )}
    >
      <AdminContentInset className="flex h-full flex-wrap items-center gap-3 lg:flex-nowrap">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded border border-border p-2 text-text-secondary hover:bg-muted lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="size-5" />
        </button>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
          <nav
            className="flex flex-wrap items-center gap-1.5 text-[11px] leading-none"
            aria-label="Fil d'Ariane"
          >
            {crumbs.map((crumb, i) => (
              <span key={crumb} className="flex items-center gap-1.5">
                {i > 0 && (
                  <span className="text-[#c5c5d3]" aria-hidden>
                    /
                  </span>
                )}
                <span
                  className={cn(
                    i === crumbs.length - 1
                      ? "font-semibold text-text-primary"
                      : i === 0
                        ? "font-semibold text-primary"
                        : "font-medium text-text-secondary"
                  )}
                >
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
          <h1 className="font-display text-base font-extrabold leading-5 tracking-tight text-text-primary">
            {title}
          </h1>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto sm:justify-end md:gap-3">
          <label className="relative hidden min-w-[200px] sm:block sm:w-80">
            <span className="sr-only">Recherche globale</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-text-secondary"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search entities, IDs or reports..."
              disabled
              className="h-9 w-full rounded bg-muted pl-9 pr-4 text-xs text-text-primary shadow-[0_0_0_1px_rgba(230,232,234,0.7)] placeholder:text-text-secondary/70"
              title="Recherche — démonstration"
            />
          </label>

          <span className="hidden h-5 w-px bg-border sm:block" aria-hidden />

          <div className="flex items-center gap-1 rounded border border-success-muted/60 bg-success-muted px-2.5 py-1">
            <span className="size-2 rounded bg-success" aria-hidden />
            <span className="text-[11px] font-semibold tracking-tight text-success-fg">
              Live Sync: ON
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="relative rounded p-2 text-text-secondary hover:bg-muted"
              aria-label="Notifications"
              disabled
            >
              <Bell className="size-4" />
              <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded bg-[#ba1a1a] text-[9px] font-bold text-white ring-2 ring-white">
                3
              </span>
            </button>
            <button
              type="button"
              className="rounded p-2 text-text-secondary hover:bg-muted"
              aria-label="Aide"
              disabled
            >
              <CircleHelp className="size-4" />
            </button>
          </div>

          <span className="hidden h-5 w-px bg-border sm:block" aria-hidden />

          <div className="flex items-center gap-1 rounded py-1 pr-1 pl-1.5">
            <span className="flex size-7 items-center justify-center rounded bg-[#dce1ff] text-xs font-bold text-primary">
              {profileInitials}
            </span>
            <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              Admin
            </span>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded p-2 text-text-secondary hover:bg-muted"
              aria-label="Se déconnecter"
              title="Se déconnecter"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </AdminContentInset>
    </header>
  );
}
