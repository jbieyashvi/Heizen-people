"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TicketFilterState } from "@/lib/types";
import { STATUS_ORDER, STATUS_META } from "@/lib/support/statusConfig";
import { PRIORITY_ORDER, hasActiveFilters } from "@/lib/support/ticketFilters";
import { TICKET_CATEGORIES } from "@/lib/config/ticketForm";

interface TicketFiltersProps {
  filters: TicketFilterState;
  resultCount: number;
  onChange: (patch: Partial<TicketFilterState>) => void;
  onClear: () => void;
}

const fieldClass =
  "h-9 rounded-md border border-[#EAECEE] bg-white px-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-heizen-300 focus:ring-2 focus:ring-heizen-100";
const labelClass = "mb-1 block text-xs font-medium text-slate-500";

export function TicketFilters({ filters, resultCount, onChange, onClear }: TicketFiltersProps) {
  const active = hasActiveFilters(filters);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[#EAECEE] bg-white p-3.5">
      {/* Search */}
      <div className="relative">
        <label htmlFor="ticket-search" className="sr-only">
          Search by Ticket ID or Subject
        </label>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          strokeWidth={1.75}
          aria-hidden
        />
        <input
          id="ticket-search"
          type="search"
          value={filters.q}
          onChange={(e) => onChange({ q: e.target.value })}
          placeholder="Search by Ticket ID or subject…"
          className="h-9 w-full rounded-md border border-[#EAECEE] bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-heizen-300 focus:ring-2 focus:ring-heizen-100"
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[140px] flex-1">
          <label htmlFor="filter-status" className={labelClass}>
            Status
          </label>
          <select
            id="filter-status"
            value={filters.status}
            onChange={(e) => onChange({ status: e.target.value })}
            className={cn(fieldClass, "w-full")}
          >
            <option value="all">All statuses</option>
            {STATUS_ORDER.map((status) => (
              <option key={status} value={STATUS_META[status].slug}>
                {STATUS_META[status].employeeLabel}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[140px] flex-1">
          <label htmlFor="filter-category" className={labelClass}>
            Category
          </label>
          <select
            id="filter-category"
            value={filters.category}
            onChange={(e) => onChange({ category: e.target.value })}
            className={cn(fieldClass, "w-full")}
          >
            <option value="all">All categories</option>
            {TICKET_CATEGORIES.map((c) => (
              <option key={c.key} value={c.label}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[120px] flex-1">
          <label htmlFor="filter-priority" className={labelClass}>
            Priority
          </label>
          <select
            id="filter-priority"
            value={filters.priority}
            onChange={(e) => onChange({ priority: e.target.value })}
            className={cn(fieldClass, "w-full")}
          >
            <option value="all">All priorities</option>
            {PRIORITY_ORDER.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-from" className={labelClass}>
            Created from
          </label>
          <input
            id="filter-from"
            type="date"
            value={filters.from}
            max={filters.to || undefined}
            onChange={(e) => onChange({ from: e.target.value })}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="filter-to" className={labelClass}>
            Created to
          </label>
          <input
            id="filter-to"
            type="date"
            value={filters.to}
            min={filters.from || undefined}
            onChange={(e) => onChange({ to: e.target.value })}
            className={fieldClass}
          />
        </div>
      </div>

      {/* Result count + clear */}
      <div className="flex items-center justify-between gap-3 border-t border-[#EAECEE] pt-3">
        <p className="text-xs text-slate-500" aria-live="polite">
          <span className="font-medium text-slate-700">{resultCount}</span>{" "}
          {resultCount === 1 ? "ticket" : "tickets"} found
        </p>
        <button
          type="button"
          onClick={onClear}
          disabled={!active}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-2.5 text-xs font-medium text-slate-600 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          Clear All Filters
        </button>
      </div>
    </div>
  );
}
