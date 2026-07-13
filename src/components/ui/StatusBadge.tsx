import { cn } from "@/lib/cn";
import type { TicketStatus } from "@/lib/types";

const STATUS_STYLES: Record<TicketStatus, string> = {
  Open: "border-slate-200 bg-slate-50 text-slate-700",
  Assigned: "border-indigo-100 bg-indigo-50 text-indigo-700",
  "In Progress": "border-heizen-200 bg-heizen-50 text-heizen-700",
  "Waiting for Employee": "border-amber-200 bg-amber-50 text-amber-700",
  Resolved: "border-emerald-100 bg-emerald-50 text-emerald-700",
  Closed: "border-slate-200 bg-slate-100 text-slate-500",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {status}
    </span>
  );
}
