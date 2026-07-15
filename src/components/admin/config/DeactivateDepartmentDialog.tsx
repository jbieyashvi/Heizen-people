"use client";

import { useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";
import type { AgentTicket } from "@/lib/types";
import type { Department, OrgConfig } from "@/lib/admin/orgTypes";
import { Dialog } from "@/components/ui/Dialog";
import { activeTicketsForTeam, teamsForDepartment } from "@/lib/admin/orgStats";
import { inputClass } from "@/components/admin/config/ui";

interface Props {
  open: boolean;
  department: Department | null;
  config: OrgConfig;
  tickets: AgentTicket[];
  onCancel: () => void;
  onConfirm: (reassignToTicketTeam?: string) => void;
}

export function DeactivateDepartmentDialog({ open, department, config, tickets, onCancel, onConfirm }: Props) {
  const [dest, setDest] = useState("");

  useEffect(() => {
    if (open) setDest("");
  }, [open, department]);

  if (!open || !department) return null;

  const teams = teamsForDepartment(config, department.id);
  const activeTeams = teams.filter((t) => t.status === "Active");
  const activeTicketCount = teams.reduce((n, t) => n + activeTicketsForTeam(tickets, t.ticketTeam).length, 0);
  const needsReassign = activeTicketCount > 0;

  // Destination teams belong to other active departments.
  const destinationTeams = config.teams.filter(
    (t) => t.departmentId !== department.id && t.status === "Active",
  );
  const canConfirm = !needsReassign || (dest !== "" && destinationTeams.length > 0);

  return (
    <Dialog open={open} onClose={onCancel} role="alertdialog" labelledBy="deact-title" describedBy="deact-desc" className="w-full max-w-md rounded-lg border border-[#EAECEE] bg-white p-5 shadow-panel">
      <div className="flex gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-100 bg-amber-50 text-amber-600">
          <TriangleAlert className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
        </span>
        <div>
          <h2 id="deact-title" className="text-sm font-semibold text-slate-900">Deactivate {department.name}?</h2>
          <p id="deact-desc" className="mt-1 text-sm text-slate-500">The department is removed from new-ticket routing. Historical tickets are preserved.</p>
        </div>
      </div>

      {/* Impact */}
      <dl className="mt-4 rounded-md border border-[#EAECEE] bg-surface-muted px-3 py-2 text-xs">
        <div className="flex justify-between py-0.5"><dt className="text-slate-400">Active teams</dt><dd className="font-medium text-slate-700">{activeTeams.length}</dd></div>
        <div className="flex justify-between py-0.5"><dt className="text-slate-400">Active tickets</dt><dd className="font-medium text-slate-700">{activeTicketCount}</dd></div>
        <div className="flex justify-between gap-3 py-0.5"><dt className="shrink-0 text-slate-400">Linked categories</dt><dd className="truncate text-right font-medium text-slate-700">{department.categories.join(", ") || "—"}</dd></div>
      </dl>

      {needsReassign && (
        <div className="mt-3">
          {destinationTeams.length === 0 ? (
            <p className="rounded-md border border-red-200 bg-red-50/60 px-3 py-2 text-xs font-medium text-red-700">
              No active destination team available for reassignment. Activate another department first, or cancel.
            </p>
          ) : (
            <>
              <label htmlFor="deact-dest" className="mb-1 block text-xs font-medium text-slate-600">Reassign active tickets to <span className="text-red-500">*</span></label>
              <select id="deact-dest" value={dest} onChange={(e) => setDest(e.target.value)} className={inputClass}>
                <option value="">Select a destination team…</option>
                {destinationTeams.map((t) => (
                  <option key={t.id} value={t.ticketTeam}>{t.name} ({t.ticketTeam})</option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-slate-400">{activeTicketCount} active ticket{activeTicketCount === 1 ? "" : "s"} will be reassigned.</p>
            </>
          )}
        </div>
      )}

      <div className="mt-5 flex justify-end gap-2.5">
        <button type="button" onClick={onCancel} className="inline-flex h-9 items-center rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400">Cancel</button>
        <button type="button" disabled={!canConfirm} onClick={() => onConfirm(needsReassign ? dest : undefined)} className="inline-flex h-9 items-center rounded-md bg-amber-500 px-3.5 text-sm font-medium text-white outline-none hover:bg-amber-600 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">Deactivate</button>
      </div>
    </Dialog>
  );
}
