import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded bg-muted/60 px-6 py-12 text-center">
      <Inbox className="size-10 text-text-secondary/50" aria-hidden />
      <p className="mt-4 font-display text-sm font-bold text-text-primary">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-xs text-text-secondary">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
