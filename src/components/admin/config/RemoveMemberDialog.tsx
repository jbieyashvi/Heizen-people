"use client";

import { useEffect, useState } from "react";
import { TriangleAlert, UserX } from "lucide-react";
import type { AgentTicket } from "@/lib/types";
import type { OrgConfig, SupportTeam, TeamMember } from "@/lib/admin/orgTypes";
import { Dialog } from "@/components/ui/Dialog";
import { activeTicketsForMember } from "@/lib/admin/orgStats";
import { inputClass } from "@/components/admin/config/ui";

interface Props {
  open: boolean;
  member: TeamMember | null;
  team: SupportTeam;
  config: OrgConfig;
  tickets: AgentTicket[];
  onCancel: () => void;
  onConfirm: (reassignTo?: { name: string; id: string }) => void;
}

export function RemoveMemberDialog({ open, member, team, config, tickets, onCancel, onConfirm }: Props) {
  const [dest, setDest] = useState("");
  useEffect(() => { if (open) setDest(""); }, [open, member]);
  if (!open || !member) return null;

  const activeCount = activeTicketsForMember(tickets, member.name).length;
  const replacements = config.members.filter((m) => m.teamId === team.id && m.id !== member.id && m.status === "Active");
  const needsReassign = activeCount > 0;
  const noReplacement = needsReassign && replacements.length === 0;
  const canConfirm = !needsReassign || dest !== "";

  return (
    <Dialog open={open} onClose={onCancel} role="alertdialog" labelledBy="rm-title" describedBy="rm-desc" className="w-full max-w-sm rounded-lg border border-[#EAECEE] bg-white p-5 shadow-panel">
      <div className="flex gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-600"><UserX className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden /></span>
        <div>
          <h2 id="rm-title" className="text-sm font-semibold text-slate-900">Remove {member.name}?</h2>
          <p id="rm-desc" className="mt-1 text-sm text-slate-500">Remove this member from {team.name}.</p>
        </div>
      </div>

      {needsReassign && (
        <div className="mt-4">
          <p className="flex items-start gap-1.5 text-xs text-amber-700">
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
            {member.name} has {activeCount} active ticket{activeCount === 1 ? "" : "s"}. They must be reassigned first.
          </p>
          {noReplacement ? (
            <p className="mt-2 rounded-md border border-red-200 bg-red-50/60 px-3 py-2 text-xs font-medium text-red-700">No available replacement agent on this team. Add a member first, or cancel.</p>
          ) : (
            <div className="mt-2">
              <label htmlFor="rm-dest" className="mb-1 block text-xs font-medium text-slate-600">Reassign tickets to <span className="text-red-500">*</span></label>
              <select id="rm-dest" value={dest} onChange={(e) => setDest(e.target.value)} className={inputClass}>
                <option value="">Select a team member…</option>
                {replacements.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
              </select>
            </div>
          )}
        </div>
      )}

      <div className="mt-5 flex justify-end gap-2.5">
        <button type="button" onClick={onCancel} className="inline-flex h-9 items-center rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400">Cancel</button>
        <button type="button" disabled={!canConfirm || noReplacement} onClick={() => {
          const r = replacements.find((m) => m.id === dest);
          onConfirm(needsReassign && r ? { name: r.name, id: r.id } : undefined);
        }} className="inline-flex h-9 items-center rounded-md bg-red-600 px-3.5 text-sm font-medium text-white outline-none hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">Remove Member</button>
      </div>
    </Dialog>
  );
}
