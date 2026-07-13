import { cn } from "@/lib/cn";
import type { TicketPriority } from "@/lib/types";

const PRIORITY_STYLES: Record<TicketPriority, string> = {
  Low: "text-slate-500",
  Medium: "text-heizen-700",
  High: "text-amber-600",
};

const DOT_STYLES: Record<TicketPriority, string> = {
  Low: "bg-slate-300",
  Medium: "bg-heizen-500",
  High: "bg-amber-500",
};

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", PRIORITY_STYLES[priority])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT_STYLES[priority])} aria-hidden />
      {priority}
    </span>
  );
}
