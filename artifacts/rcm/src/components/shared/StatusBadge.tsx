import { cn } from "@/lib/utils";

type StatusVariant =
  | "pending" | "submitted" | "paid" | "denied" | "appealed" | "partial"
  | "active" | "inactive" | "open" | "resolved" | "posted" | "outstanding"
  | "overdue" | "billed" | "draft" | "critical" | "high" | "medium" | "low"
  | "commercial" | "government" | "self-pay" | string;

const variantStyles: Record<string, string> = {
  pending:     "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  submitted:   "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  paid:        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  denied:      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  appealed:    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  partial:     "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  active:      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  inactive:    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  open:        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  resolved:    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  posted:      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  outstanding: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  overdue:     "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  billed:      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  draft:       "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  critical:    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  high:        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  medium:      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  low:         "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  commercial:  "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  government:  "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
};

interface StatusBadgeProps {
  status: StatusVariant;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const key = status.toLowerCase().replace(/\s+/g, "-");
  const styles = variantStyles[key] ?? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  return (
    <span
      data-testid={`status-badge-${key}`}
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize",
        styles,
        className
      )}
    >
      {status}
    </span>
  );
}
