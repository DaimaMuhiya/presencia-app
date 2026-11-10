import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-9 w-full rounded bg-surface px-3 text-sm text-text-primary",
        "shadow-[0_0_0_1px_rgba(230,232,234,0.9)] placeholder:text-text-secondary/60",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary",
        className
      )}
      {...props}
    />
  );
}
