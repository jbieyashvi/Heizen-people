"use client";

import { cn } from "@/lib/cn";
import { STATUS_ORDER, STATUS_META } from "@/lib/support/statusConfig";
import type { StatusCounts } from "@/lib/support/ticketFilters";

interface SummaryItem {
  slug: string;
  label: string;
  count: number;
  needsAction?: boolean;
}

interface TicketSummaryBarProps {
  counts: StatusCounts;
  activeSlug: string;
  onSelect: (slug: string) => void;
}

/** Compact, selectable status summary that doubles as quick filters. */
export function TicketSummaryBar({ counts, activeSlug, onSelect }: TicketSummaryBarProps) {
  const items: SummaryItem[] = [
    { slug: "all", label: "All Tickets", count: counts.all },
    ...STATUS_ORDER.map((status) => ({
      slug: STATUS_META[status].slug,
      label: STATUS_META[status].employeeLabel,
      count: counts.byStatus[status],
      needsAction: STATUS_META[status].needsEmployeeAction,
    })),
  ];

  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7" aria-label="Ticket status summary">
      {items.map((item) => {
        const isActive = activeSlug === item.slug;
        return (
          <li key={item.slug}>
            <button
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(item.slug)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-left outline-none transition-colors",
                "focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-1",
                isActive
                  ? "border-heizen-300 bg-heizen-50"
                  : item.needsAction
                    ? "border-amber-200 bg-amber-50/60 hover:bg-amber-50"
                    : "border-[#EAECEE] bg-white hover:bg-slate-50",
              )}
            >
              <span
                className={cn(
                  "truncate text-xs font-medium",
                  isActive
                    ? "text-heizen-800"
                    : item.needsAction
                      ? "text-amber-800"
                      : "text-slate-500",
                )}
              >
                {item.label}
              </span>
              <span
                className={cn(
                  "shrink-0 text-sm font-semibold tabular-nums",
                  isActive
                    ? "text-heizen-800"
                    : item.needsAction
                      ? "text-amber-800"
                      : "text-slate-900",
                )}
              >
                {item.count}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
