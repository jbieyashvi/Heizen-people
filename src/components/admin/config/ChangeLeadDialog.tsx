"use client";

import { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import type { OrgConfig, SupportTeam } from "@/lib/admin/orgTypes";
import { Dialog } from "@/components/ui/Dialog";
import { inputClass } from "@/components/admin/config/ui";

interface Props {
  open: boolean;
  team: SupportTeam;
  config: OrgConfig;
  onCancel: () => void;
  onConfirm: (memberId: string) => void;
}

export function ChangeLeadDialog({ open, team, config, onCancel, onConfirm }: Props) {
  const [selected, setSelected] = useState("");
  useEffect(() => { if (open) setSelected(""); }, [open, team]);
  if (!open) return null;

  const members = config.members.filter((m) => m.teamId === team.id && m.status === "Active");
  const eligible = members.filter((m) => m.name !== team.lead);

  return (
    <Dialog open={open} onClose={onCancel} labelledBy="lead-title">
      <div className="flex gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-heizen-100 bg-heizen-50 text-heizen-700"><Crown className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden /></span>
        <div>
          <h2 id="lead-title" className="text-sm font-semibold text-slate-900">Change Team Lead</h2>
          <p className="mt-1 text-sm text-slate-500">Current lead: <span className="font-medium text-slate-700">{team.lead}</span></p>
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="lead-select" className="mb-1 block text-xs font-medium text-slate-600">New team lead <span className="text-red-500">*</span></label>
        {eligible.length === 0 ? (
          <p className="rounded-md border border-[#EAECEE] bg-surface-muted px-3 py-2 text-xs text-slate-500">No other active members available to promote.</p>
        ) : (
          <select id="lead-select" value={selected} onChange={(e) => setSelected(e.target.value)} className={inputClass}>
            <option value="">Select a member…</option>
            {eligible.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
          </select>
        )}
      </div>

      <div className="mt-5 flex justify-end gap-2.5">
        <button type="button" onClick={onCancel} className="inline-flex h-9 items-center rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400">Cancel</button>
        <button type="button" disabled={!selected} onClick={() => onConfirm(selected)} className="inline-flex h-9 items-center rounded-md bg-heizen-500 px-3.5 text-sm font-medium text-white outline-none hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">Confirm</button>
      </div>
    </Dialog>
  );
}
