"use client";

import Link from "next/link";
import { Layers, RotateCcw } from "lucide-react";
import type { AdminFilterState } from "@/lib/admin/adminFilters";
import { hasActiveFilters } from "@/lib/admin/adminFilters";
import { RANGE_OPTIONS } from "@/lib/admin/dateRange";
import { ORG_TEAMS } from "@/lib/roles/roles";
import { ADMIN_CATEGORIES } from "@/lib/admin/analytics";

interface AdminHeaderProps {
  filters: AdminFilterState;
  onChange: (patch: Partial<AdminFilterState>) => void;
  onReset: () => void;
}

const field = "h-9 rounded-md border border-[#EAECEE] bg-white px-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-heizen-300 focus:ring-2 focus:ring-heizen-100";

export function AdminHeader({ filters, onChange, onReset }: AdminHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Admin Overview</h2>
          <p className="mt-0.5 text-sm text-slate-500">Monitor employee support operations across the organization.</p>
        </div>
        <Link
          href="/admin/tickets"
          className="inline-flex h-9 w-fit shrink-0 items-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400"
        >
          <Layers className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden />
          View All Tickets
        </Link>
      </div>

      {/* Global dashboard filters (inline — no modal) */}
      <div className="flex flex-wrap items-end gap-2.5 rounded-lg border border-[#EAECEE] bg-white p-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="a-range" className="text-xs font-medium text-slate-500">Date range</label>
          <select id="a-range" value={filters.range} onChange={(e) => onChange({ range: e.target.value as AdminFilterState["range"] })} className={field}>
            {RANGE_OPTIONS.map((r) => (<option key={r.key} value={r.key}>{r.label}</option>))}
          </select>
        </div>

        {filters.range === "custom" && (
          <>
            <div className="flex flex-col gap-1">
              <label htmlFor="a-from" className="text-xs font-medium text-slate-500">From</label>
              <input id="a-from" type="date" value={filters.from} max={filters.to || undefined} onChange={(e) => onChange({ from: e.target.value })} className={field} />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="a-to" className="text-xs font-medium text-slate-500">To</label>
              <input id="a-to" type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => onChange({ to: e.target.value })} className={field} />
            </div>
          </>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="a-team" className="text-xs font-medium text-slate-500">Department / Team</label>
          <select id="a-team" value={filters.team} onChange={(e) => onChange({ team: e.target.value })} className={field}>
            <option value="all">All teams</option>
            {ORG_TEAMS.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="a-category" className="text-xs font-medium text-slate-500">Category</label>
          <select id="a-category" value={filters.category} onChange={(e) => onChange({ category: e.target.value })} className={field}>
            <option value="all">All categories</option>
            {ADMIN_CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>

        <button
          type="button"
          onClick={onReset}
          disabled={!hasActiveFilters(filters)}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-3 text-sm font-medium text-slate-600 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden />
          Reset Filters
        </button>
      </div>
    </div>
  );
}
