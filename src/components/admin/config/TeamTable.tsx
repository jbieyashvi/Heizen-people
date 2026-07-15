"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Pencil, Power } from "lucide-react";
import type { AgentTicket } from "@/lib/types";
import type { OrgConfig, SupportTeam } from "@/lib/admin/orgTypes";
import { membersForTeam, teamStats } from "@/lib/admin/orgStats";
import { StatusTag } from "@/components/admin/config/ui";

interface Props {
  teams: SupportTeam[];
  config: OrgConfig;
  tickets: AgentTicket[];
  onView: (t: SupportTeam) => void;
  onEdit: (t: SupportTeam) => void;
  onToggleStatus: (t: SupportTeam) => void;
}

function RowMenu({ team, onEdit, onToggleStatus }: { team: SupportTeam; onEdit: (t: SupportTeam) => void; onToggleStatus: (t: SupportTeam) => void }) {
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
      <button type="button" aria-haspopup="menu" aria-expanded={open} aria-label={`More actions for ${team.name}`} onClick={() => setOpen((v) => !v)} className="flex h-7 w-7 items-center justify-center rounded-md border border-[#EAECEE] text-slate-500 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400">
        <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-8 z-20 w-44 overflow-hidden rounded-md border border-[#EAECEE] bg-white py-1 shadow-panel">
          <button type="button" role="menuitem" onClick={() => { setOpen(false); onEdit(team); }} className={item}><Pencil className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden /> Edit</button>
          <button type="button" role="menuitem" onClick={() => { setOpen(false); onToggleStatus(team); }} className={item}><Power className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden /> {team.status === "Active" ? "Deactivate" : "Activate"}</button>
        </div>
      )}
    </div>
  );
}

const COLUMNS = ["Team", "Department", "Team Lead", "Members", "Active Tickets", "Due Soon", "Overdue", "SLA Compliance", "Status", "Action"];

export function TeamTable({ teams, config, tickets, onView, onEdit, onToggleStatus }: Props) {
  const deptName = (id: string) => config.departments.find((d) => d.id === id)?.name ?? "—";
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[#EAECEE] bg-surface-muted">
            {COLUMNS.map((c) => (<th key={c} scope="col" className="whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{c}</th>))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EAECEE]">
          {teams.map((t) => {
            const s = teamStats(tickets, t.ticketTeam);
            const members = membersForTeam(config, t.id).filter((m) => m.status === "Active").length;
            return (
              <tr key={t.id} onClick={() => onView(t)} className="cursor-pointer transition-colors hover:bg-slate-50/70">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-700">{t.name}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{deptName(t.departmentId)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{t.lead}</td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-600">{members}</td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-600">{s.active}</td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-600">{s.dueSoon}</td>
                <td className={s.overdue > 0 ? "whitespace-nowrap px-4 py-3 font-medium tabular-nums text-red-600" : "whitespace-nowrap px-4 py-3 tabular-nums text-slate-600"}>{s.overdue}</td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-600">{s.sla}%</td>
                <td className="whitespace-nowrap px-4 py-3"><StatusTag status={t.status} /></td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button type="button" onClick={() => onView(t)} className="inline-flex items-center rounded-md border border-[#EAECEE] px-2.5 py-1 text-xs font-medium text-heizen-700 outline-none transition-colors hover:border-heizen-200 hover:bg-heizen-50 focus-visible:ring-2 focus-visible:ring-heizen-400">View</button>
                    <RowMenu team={t} onEdit={onEdit} onToggleStatus={onToggleStatus} />
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
