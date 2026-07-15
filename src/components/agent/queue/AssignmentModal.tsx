"use client";

import { useEffect, useState } from "react";
import { UserCheck, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import type { AgentTicket } from "@/lib/types";
import { Dialog } from "@/components/ui/Dialog";
import { getPeopleOpsAgents } from "@/lib/agent/team";
import { currentAgent } from "@/lib/roles/roles";
import type { TeamMemberWorkload } from "@/lib/agent/agentTickets";

interface AssignmentModalProps {
  open: boolean;
  ticket: AgentTicket | null;
  workloads: TeamMemberWorkload[];
  onCancel: () => void;
  onConfirm: (agentName: string, agentId: string) => void;
}

const LOAD_LABEL: Record<TeamMemberWorkload["load"], string> = {
  available: "Available",
  balanced: "Balanced",
  heavy: "Heavy",
};

export function AssignmentModal({ open, ticket, workloads, onCancel, onConfirm }: AssignmentModalProps) {
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (open) setSelected(ticket?.assignedAgentId ?? null);
  }, [open, ticket]);

  if (!open || !ticket) return null;

  const agents = getPeopleOpsAgents();
  const isReassign = ticket.assignedAgent !== null;
  const workloadFor = (name: string) => workloads.find((w) => w.name === name);

  const confirm = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    if (agent) onConfirm(agent.name, agent.id);
  };

  return (
    <Dialog open={open} onClose={onCancel} labelledBy="assign-title" describedBy="assign-desc">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="assign-title" className="text-sm font-semibold text-slate-900">
            {isReassign ? "Reassign ticket" : "Assign ticket"}
          </h2>
          <p id="assign-desc" className="mt-0.5 text-xs text-slate-500">
            Route this request to a People Operations agent.
          </p>
        </div>
        <button
          type="button"
          onClick={() => confirm(currentAgent.id)}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-heizen-500 px-2.5 text-xs font-medium text-white outline-none transition-colors hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-2"
        >
          <UserCheck className="h-4 w-4" strokeWidth={2} aria-hidden />
          Assign to Me
        </button>
      </div>

      {/* Ticket summary */}
      <dl className="mt-3 rounded-md border border-[#EAECEE] bg-surface-muted px-3 py-2 text-xs">
        <div className="flex justify-between gap-3 py-0.5">
          <dt className="text-slate-400">Ticket</dt>
          <dd className="font-mono font-medium text-slate-700">{ticket.id}</dd>
        </div>
        <div className="flex justify-between gap-3 py-0.5">
          <dt className="shrink-0 text-slate-400">Subject</dt>
          <dd className="truncate text-right font-medium text-slate-700" title={ticket.subject}>{ticket.subject}</dd>
        </div>
        <div className="flex justify-between gap-3 py-0.5">
          <dt className="text-slate-400">Assigned team</dt>
          <dd className="font-medium text-slate-700">{ticket.assignedTeam}</dd>
        </div>
        {isReassign && (
          <div className="flex justify-between gap-3 py-0.5">
            <dt className="text-slate-400">Current assignee</dt>
            <dd className="font-medium text-slate-700">{ticket.assignedAgent}</dd>
          </div>
        )}
      </dl>

      {/* Agent picker */}
      <fieldset className="mt-3">
        <legend className="mb-1.5 text-xs font-medium text-slate-500">Select Support Agent</legend>
        <ul className="flex flex-col gap-1.5">
          {agents.map((agent) => {
            const w = workloadFor(agent.name);
            const active = selected === agent.id;
            return (
              <li key={agent.id}>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 outline-none transition-colors",
                    active ? "border-heizen-300 bg-heizen-50" : "border-[#EAECEE] bg-white hover:bg-slate-50",
                  )}
                >
                  <input
                    type="radio"
                    name="assign-agent"
                    value={agent.id}
                    checked={active}
                    onChange={() => setSelected(agent.id)}
                    className="sr-only"
                  />
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-heizen-100 text-xs font-semibold text-heizen-700">
                    {agent.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-slate-800">
                      {agent.name}
                      {agent.id === currentAgent.id && <span className="ml-1 text-xs font-normal text-slate-400">(You)</span>}
                    </span>
                    <span className="block text-xs text-slate-400">
                      {w ? `${w.active} active · ${w.dueSoon} due soon · ${LOAD_LABEL[w.load]}` : "No active tickets"}
                    </span>
                  </span>
                  {active && <Check className="h-4 w-4 text-heizen-600" strokeWidth={2} aria-hidden />}
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="mt-4 flex justify-end gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-9 items-center rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!selected}
          onClick={() => selected && confirm(selected)}
          className="inline-flex h-9 items-center rounded-md bg-heizen-500 px-3.5 text-sm font-medium text-white outline-none transition-colors hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          Confirm Assignment
        </button>
      </div>
    </Dialog>
  );
}
