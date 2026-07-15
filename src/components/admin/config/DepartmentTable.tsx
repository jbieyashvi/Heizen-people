"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Pencil, Power } from "lucide-react";
import type { AgentTicket } from "@/lib/types";
import type { Department, OrgConfig } from "@/lib/admin/orgTypes";
import { departmentStats } from "@/lib/admin/orgStats";
import { StatusTag } from "@/components/admin/config/ui";

interface DepartmentTableProps {
  departments: Department[];
  config: OrgConfig;
  tickets: AgentTicket[];
  onView: (d: Department) => void;
  onEdit: (d: Department) => void;
  onToggleStatus: (d: Department) => void;
}

function RowMenu({ department, onEdit, onToggleStatus }: { department: Department; onEdit: (d: Department) => void; onToggleStatus: (d: Department) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const item = "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-slate-600 outline-none hover:bg-slate-50 focus-visible:bg-slate-50";
  return (
    <div className="relative inline-block" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button type="button" aria-haspopup="menu" aria-expanded={open} aria-label={`More actions for ${department.name}`} onClick={() => setOpen((v) => !v)} className="flex h-7 w-7 items-center justify-center rounded-md border border-[#EAECEE] text-slate-500 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400">
        <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-8 z-20 w-44 overflow-hidden rounded-md border border-[#EAECEE] bg-white py-1 shadow-panel">
          <button type="button" role="menuitem" onClick={() => { setOpen(false); onEdit(department); }} className={item}>
            <Pencil className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden /> Edit
          </button>
          <button type="button" role="menuitem" onClick={() => { setOpen(false); onToggleStatus(department); }} className={item}>
            <Power className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden />
            {department.status === "Active" ? "Deactivate" : "Activate"}
          </button>
        </div>
      )}
    </div>
  );
}

const COLUMNS = ["Department", "Code", "Lead", "Support Teams", "Categories Handled", "Active Tickets", "SLA Compliance", "Status", "Action"];

export function DepartmentTable({ departments, config, tickets, onView, onEdit, onToggleStatus }: DepartmentTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[#EAECEE] bg-surface-muted">
            {COLUMNS.map((c) => (
              <th key={c} scope="col" className="whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EAECEE]">
          {departments.map((d) => {
            const s = departmentStats(config, tickets, d);
            return (
              <tr key={d.id} onClick={() => onView(d)} className="cursor-pointer transition-colors hover:bg-slate-50/70">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-700">{d.name}</td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500">{d.code}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{d.lead}</td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-600">{s.teamsCount}</td>
                <td className="max-w-[240px] truncate px-4 py-3 text-slate-500" title={d.categories.join(", ")}>{d.categories.join(", ") || "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-600">{s.activeTickets}</td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-600">{s.sla}%</td>
                <td className="whitespace-nowrap px-4 py-3"><StatusTag status={d.status} /></td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button type="button" onClick={() => onView(d)} className="inline-flex items-center rounded-md border border-[#EAECEE] px-2.5 py-1 text-xs font-medium text-heizen-700 outline-none transition-colors hover:border-heizen-200 hover:bg-heizen-50 focus-visible:ring-2 focus-visible:ring-heizen-400">View</button>
                    <RowMenu department={d} onEdit={onEdit} onToggleStatus={onToggleStatus} />
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
