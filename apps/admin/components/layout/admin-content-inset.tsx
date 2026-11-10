import type { ReactNode } from "react";
import { ADMIN_MAIN_PADDING_X } from "@/lib/constants";
import { cn } from "@/lib/utils";

type AdminContentInsetProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "main";
};

export function AdminContentInset({
  children,
  className,
  as: Tag = "div",
}: AdminContentInsetProps) {
  return (
    <Tag className={cn("w-full min-w-0", ADMIN_MAIN_PADDING_X, className)}>
      {children}
    </Tag>
  );
}
