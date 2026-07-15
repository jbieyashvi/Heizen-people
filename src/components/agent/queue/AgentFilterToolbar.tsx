"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { AgentFilterState } from "@/lib/agent/agentFilters";
import { activeFilterCount } from "@/lib/agent/agentFilters";
import { STATUS_ORDER } from "@/lib/support/statusConfig";
import { PEOPLE_OPS_AGENTS, PEOPLE_OPS_CATEGORIES } from "@/lib/agent/team";

interface ToolbarProps {
  filters: AgentFilterState;
  onChange: (patch: Partial<AgentFilterState>) => void;
  onClear: () => void;
}

const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const SLA_STATES: { value: string; label: string }[] = [
  { value: "within", label: "Within SLA" },
  { value: "approaching", label: "Approaching" },
  { value: "breached", label: "Breached" },
  { value: "paused", label: "Paused" },
  { value: "met", label: "Completed" },
];

const field = "h-9 w-full rounded-md border border-[#EAECEE] bg-white px-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-heizen-300 focus:ring-2 focus:ring-heizen-100";
const labelCls = "mb-1 block text-xs font-medium text-slate-500";

interface Chip {
  key: keyof AgentFilterState | "created" | "updated";
  label: string;
  clear: Partial<AgentFilterState>;
}

function buildChips(f: AgentFilterState): Chip[] {
  const chips: Chip[] = [];
  if (f.status !== "all") chips.push({ key: "status", label: `Status: ${f.status}`, clear: { status: "all" } });
  if (f.category !== "all") chips.push({ key: "category", label: `Category: ${f.category}`, clear: { category: "all" } });
  if (f.priority !== "all") chips.push({ key: "priority", label: `Priority: ${f.priority}`, clear: { priority: "all" } });
  if (f.agent !== "all")
    chips.push({ key: "agent", label: `Agent: ${f.agent === "unassigned" ? "Unassigned" : f.agent}`, clear: { agent: "all" } });
  if (f.sla !== "all") chips.push({ key: "sla", label: `SLA: ${f.sla}`, clear: { sla: "all" } });
  if (f.createdFrom || f.createdTo)
    chips.push({ key: "created", label: "Created date", clear: { createdFrom: "", createdTo: "" } });
  if (f.updatedFrom || f.updatedTo)
    chips.push({ key: "updated", label: "Updated date", clear: { updatedFrom: "", updatedTo: "" } });
  return chips;
}

export function AgentFilterToolbar({ filters, onChange, onClear }: ToolbarProps) {
  const [open, setOpen] = useState(false);
  const count = activeFilterCount(filters);
  const chips = buildChips(filters);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="agent-search" className="sr-only">
            Search ticket ID, employee or subject
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={1.75} aria-hidden />
          <input
            id="agent-search"
            type="search"
            value={filters.q}
            onChange={(e) => onChange({ q: e.target.value })}
            placeholder="Search ticket ID, employee or subject…"
            className="h-9 w-full rounded-md border border-[#EAECEE] bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-heizen-300 focus:ring-2 focus:ring-heizen-100"
          />
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={cn(
            "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-heizen-400",
            open || count > 0 ? "border-heizen-200 bg-heizen-50 text-heizen-700" : "border-[#EAECEE] bg-white text-slate-600 hover:bg-slate-50",
          )}
        >
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Filters
          {count > 0 && (
            <span className="rounded bg-heizen-100 px-1.5 text-[11px] font-semibold text-heizen-700">{count}</span>
          )}
        </button>
      </div>

      {/* Compact expandable filter panel (not a large modal) */}
      {open && (
        <div className="grid grid-cols-1 gap-3 rounded-lg border border-[#EAECEE] bg-white p-3.5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="f-status" className={labelCls}>Status</label>
            <select id="f-status" value={filters.status} onChange={(e) => onChange({ status: e.target.value })} className={field}>
              <option value="all">All statuses</option>
              {STATUS_ORDER.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="f-category" className={labelCls}>Category</label>
            <select id="f-category" value={filters.category} onChange={(e) => onChange({ category: e.target.value })} className={field}>
              <option value="all">All categories</option>
              {PEOPLE_OPS_CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="f-priority" className={labelCls}>Priority</label>
            <select id="f-priority" value={filters.priority} onChange={(e) => onChange({ priority: e.target.value })} className={field}>
              <option value="all">All priorities</option>
              {PRIORITIES.map((p) => (<option key={p} value={p}>{p}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="f-agent" className={labelCls}>Assigned Agent</label>
            <select id="f-agent" value={filters.agent} onChange={(e) => onChange({ agent: e.target.value })} className={field}>
              <option value="all">All agents</option>
              <option value="unassigned">Unassigned</option>
              {PEOPLE_OPS_AGENTS.map((a) => (<option key={a.id} value={a.name}>{a.name}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="f-sla" className={labelCls}>SLA State</label>
            <select id="f-sla" value={filters.sla} onChange={(e) => onChange({ sla: e.target.value })} className={field}>
              <option value="all">All SLA states</option>
              {SLA_STATES.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="f-cfrom" className={labelCls}>Created from</label>
              <input id="f-cfrom" type="date" value={filters.createdFrom} max={filters.createdTo || undefined} onChange={(e) => onChange({ createdFrom: e.target.value })} className={field} />
            </div>
            <div>
              <label htmlFor="f-cto" className={labelCls}>Created to</label>
              <input id="f-cto" type="date" value={filters.createdTo} min={filters.createdFrom || undefined} onChange={(e) => onChange({ createdTo: e.target.value })} className={field} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="f-ufrom" className={labelCls}>Updated from</label>
              <input id="f-ufrom" type="date" value={filters.updatedFrom} max={filters.updatedTo || undefined} onChange={(e) => onChange({ updatedFrom: e.target.value })} className={field} />
            </div>
            <div>
              <label htmlFor="f-uto" className={labelCls}>Updated to</label>
              <input id="f-uto" type="date" value={filters.updatedTo} min={filters.updatedFrom || undefined} onChange={(e) => onChange({ updatedTo: e.target.value })} className={field} />
            </div>
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => onChange(chip.clear)}
              className="inline-flex items-center gap-1 rounded-md border border-[#EAECEE] bg-white px-2 py-0.5 text-xs font-medium text-slate-600 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400"
            >
              {chip.label}
              <X className="h-3 w-3 text-slate-400" strokeWidth={2} aria-hidden />
            </button>
          ))}
          <button
            type="button"
            onClick={onClear}
            className="rounded text-xs font-medium text-heizen-700 outline-none hover:text-heizen-800 focus-visible:ring-2 focus-visible:ring-heizen-400"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
