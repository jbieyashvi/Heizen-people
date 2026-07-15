import { cn } from "@/lib/cn";
import type { TicketStatus } from "@/lib/types";
import { STATUS_META, employeeStatusLabel } from "@/lib/support/statusConfig";

interface StatusBadgeProps {
  status: TicketStatus;
  /** Override the visible text. Defaults to the employee-facing label. */
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium",
        STATUS_META[status].badge,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {label ?? employeeStatusLabel(status)}
    </span>
  );
}
