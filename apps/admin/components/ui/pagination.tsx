import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  pages: number;
  from: number;
  to: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function Pagination({
  page,
  pages,
  from,
  to,
  total,
  onPageChange,
  className,
}: PaginationProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <p className="text-xs text-text-secondary">
        Showing <span className="font-semibold text-text-primary">{from}</span>–
        <span className="font-semibold text-text-primary">{to}</span> of{" "}
        <span className="font-semibold text-text-primary">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded p-2 text-text-secondary hover:bg-muted disabled:opacity-40"
          aria-label="Page précédente"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="px-2 text-xs font-semibold text-text-primary">
          {page} / {pages}
        </span>
        <button
          type="button"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          className="rounded p-2 text-text-secondary hover:bg-muted disabled:opacity-40"
          aria-label="Page suivante"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
