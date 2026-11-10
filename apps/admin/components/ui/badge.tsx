import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/types/dashboard";
import type { ReactNode } from "react";

const statusStyles: Record<AttendanceStatus, string> = {
  "ON TIME":
    "bg-success-muted text-success border border-success/20",
  LATE: "bg-warning-muted text-amber-800 border border-warning/30",
  ABSENT: "bg-danger-muted text-danger border border-danger/20",
};

type StatusBadgeProps = {
  status: AttendanceStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        statusStyles[status],
        className
      )}
    >
      {status}
    </span>
  );
}

type BadgeProps = {
  children: ReactNode;
  variant?: "default" | "outline";
  className?: string;
};

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-primary/10 text-primary",
        variant === "outline" && "border border-border text-text-secondary",
        className
      )}
    >
      {children}
    </span>
  );
}
