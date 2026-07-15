"use client";

import { useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";
import type { AgentTicket } from "@/lib/types";
import type { OrgConfig, SupportTeam } from "@/lib/admin/orgTypes";
import { Dialog } from "@/components/ui/Dialog";
import { activeTicketsForTeam } from "@/lib/admin/orgStats";
import { inputClass } from "@/components/admin/config/ui";

interface Props {
  open: boolean;
  team: SupportTeam | null;
  config: OrgConfig;
  tickets: AgentTicket[];
  onCancel: () => void;
  onConfirm: (reassignToTicketTeam?: string) => void;
}

export function DeactivateTeamDialog({ open, team, config, tickets, onCancel, onConfirm }: Props) {
  const [dest, setDest] = useState("");
  useEffect(() => { if (open) setDest(""); }, [open, team]);
  if (!open || !team) return null;

  const activeCount = activeTicketsForTeam(tickets, team.ticketTeam).length;
  const needsReassign = activeCount > 0;
  const destinations = config.teams.filter((t) => t.id !== team.id && t.status === "Active");
  const noDest = needsReassign && destinations.length === 0;
  const canConfirm = !needsReassign || dest !== "";

  return (
    <Dialog open={open} onClose={onCancel} role="alertdialog" labelledBy="dt-title" describedBy="dt-desc" className="w-full max-w-sm rounded-lg border border-[#EAECEE] bg-white p-5 shadow-panel">
      <div className="flex gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-100 bg-amber-50 text-amber-600"><TriangleAlert className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden /></span>
        <div>
          <h2 id="dt-title" className="text-sm font-semibold text-slate-900">Deactivate {team.name}?</h2>
          <p id="dt-desc" className="mt-1 text-sm text-slate-500">The team stops receiving new tickets. Historical tickets are preserved.</p>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">Active tickets: <span className="font-medium text-slate-700">{activeCount}</span></p>

      {needsReassign && (
        <div className="mt-2">
          {noDest ? (
            <p className="rounded-md border border-red-200 bg-red-50/60 px-3 py-2 text-xs font-medium text-red-700">No active destination team available. Activate another team first, or cancel.</p>
          ) : (
            <>
              <label htmlFor="dt-dest" className="mb-1 block text-xs font-medium text-slate-600">Reassign active tickets to <span className="text-red-500">*</span></label>
              <select id="dt-dest" value={dest} onChange={(e) => setDest(e.target.value)} className={inputClass}>
                <option value="">Select a destination team…</option>
                {destinations.map((t) => (<option key={t.id} value={t.ticketTeam}>{t.name} ({t.ticketTeam})</option>))}
              </select>
            </>
          )}
        </div>
      )}

      <div className="mt-5 flex justify-end gap-2.5">
        <button type="button" onClick={onCancel} className="inline-flex h-9 items-center rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400">Cancel</button>
        <button type="button" disabled={!canConfirm || noDest} onClick={() => onConfirm(needsReassign ? dest : undefined)} className="inline-flex h-9 items-center rounded-md bg-amber-500 px-3.5 text-sm font-medium text-white outline-none hover:bg-amber-600 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">Deactivate</button>
      </div>
    </Dialog>
  );
}
