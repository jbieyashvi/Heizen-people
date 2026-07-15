"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Pencil, Power, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TicketRecord, TicketStatus } from "@/lib/types";
import type { Category } from "@/lib/admin/categoryTypes";
import { resolveRouting } from "@/lib/admin/categorySelectors";
import { getCategoryIcon } from "@/lib/admin/categoryIcons";
import { StatusTag } from "@/components/admin/config/ui";

const ACTIVE: TicketStatus[] = ["Open", "Assigned", "In Progress", "Waiting for Employee"];

interface Props {
  categories: Category[];
  tickets: TicketRecord[];
  onView: (c: Category) => void;
  onEdit: (c: Category) => void;
  onMove: (id: string, dir: "up" | "down") => void;
  onToggleStatus: (c: Category) => void;
}

function RowMenu({ category, first, last, onEdit, onMove, onToggleStatus }: { category: Category; first: boolean; last: boolean; onEdit: (c: Category) => void; onMove: (id: string, dir: "up" | "down") => void; onToggleStatus: (c: Category) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!open) return; const f = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener("mousedown", f); return () => document.removeEventListener("mousedown", f); }, [open]);
  const item = "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-slate-600 outline-none hover:bg-slate-50 disabled:opacity-40";
  return (
    <div className="relative inline-block" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button type="button" aria-haspopup="menu" aria-expanded={open} aria-label={`More actions for ${category.name}`} onClick={() => setOpen((s) => !s)} className="flex h-7 w-7 items-center justify-center rounded-md border border-[#EAECEE] text-slate-500 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400"><MoreHorizontal className="h-4 w-4" strokeWidth={1.75} aria-hidden /></button>
      {open && (
        <div role="menu" className="absolute right-0 top-8 z-20 w-44 overflow-hidden rounded-md border border-[#EAECEE] bg-white py-1 shadow-panel">
          <button type="button" role="menuitem" onClick={() => { setOpen(false); onEdit(category); }} className={item}><Pencil className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden /> Edit</button>
          <button type="button" role="menuitem" disabled={first} onClick={() => { setOpen(false); onMove(category.id, "up"); }} className={item}><ArrowUp className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden /> Move Up</button>
          <button type="button" role="menuitem" disabled={last} onClick={() => { setOpen(false); onMove(category.id, "down"); }} className={item}><ArrowDown className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden /> Move Down</button>
          <button type="button" role="menuitem" onClick={() => { setOpen(false); onToggleStatus(category); }} className={item}><Power className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden /> {category.status === "Active" ? "Deactivate" : "Activate"}</button>
        </div>
      )}
    </div>
  );
}

const COLUMNS = ["Category", "Employee Description", "Request Types", "Responsible Department", "Default Support Team", "Active Tickets", "Status", "Employee Visibility", "Action"];

export function CategoryTable({ categories, tickets, onView, onEdit, onMove, onToggleStatus }: Props) {
  const activeFor = (name: string) => tickets.filter((t) => t.category === name && ACTIVE.includes(t.status)).length;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1160px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[#EAECEE] bg-surface-muted">
            {COLUMNS.map((c) => (<th key={c} scope="col" className="whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{c}</th>))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EAECEE]">
          {categories.map((c, i) => {
            const Icon = getCategoryIcon(c.icon);
            const routing = resolveRouting(c);
            return (
              <tr key={c.id} onClick={() => onView(c)} className="cursor-pointer transition-colors hover:bg-slate-50/70">
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-md border border-[#EAECEE] bg-surface-muted text-heizen-600"><Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden /></span><span className="font-medium text-slate-700">{c.name}</span></span>
                </td>
                <td className="max-w-[220px] truncate px-4 py-3 text-slate-500" title={c.description}>{c.description}</td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-600">{c.requestTypes.length}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{routing.departmentName ?? <span className="font-medium text-red-600">Missing</span>}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{routing.teamName ?? <span className="font-medium text-red-600">Missing</span>}</td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-600">{activeFor(c.name)}</td>
                <td className="whitespace-nowrap px-4 py-3"><StatusTag status={c.status} /></td>
                <td className="whitespace-nowrap px-4 py-3"><span className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium", c.visibility === "Visible" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>{c.visibility}</span></td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button type="button" onClick={() => onView(c)} className="inline-flex items-center rounded-md border border-[#EAECEE] px-2.5 py-1 text-xs font-medium text-heizen-700 outline-none hover:border-heizen-200 hover:bg-heizen-50 focus-visible:ring-2 focus-visible:ring-heizen-400">View</button>
                    <RowMenu category={c} first={i === 0} last={i === categories.length - 1} onEdit={onEdit} onMove={onMove} onToggleStatus={onToggleStatus} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
