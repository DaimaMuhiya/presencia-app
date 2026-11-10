import { cn } from "@/lib/utils";

const TONE_CLASSES = {
  green: "bg-success-muted text-success-fg",
  amber: "bg-warning-muted text-amber-800",
  rose: "bg-danger-muted text-rose-700",
  blue: "bg-primary/10 text-primary",
  neutral: "bg-muted text-text-secondary",
} as const;

type StatusBadgeProps = {
  label: string;
  tone?: keyof typeof TONE_CLASSES;
};

export function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold",
        TONE_CLASSES[tone]
      )}
    >
      {label}
    </span>
  );
}
