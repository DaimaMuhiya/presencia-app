import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  padding?: "default" | "none";
};

export function Card({
  children,
  className,
  padding = "default",
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded border border-border bg-surface shadow-sm",
        padding === "default" && "p-5 md:p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

type CardHeaderProps = {
  title: string;
  action?: ReactNode;
  className?: string;
};

export function CardHeader({ title, action, className }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "mb-5 flex flex-wrap items-center justify-between gap-3",
        className
      )}
    >
      <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      {action}
    </div>
  );
}
