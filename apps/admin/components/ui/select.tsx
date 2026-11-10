import { cn } from "@/lib/utils";
import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-9 min-w-[10rem] appearance-none rounded bg-surface px-3 pr-8 text-sm font-medium text-text-primary",
        "shadow-[0_0_0_1px_rgba(230,232,234,0.9)]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
