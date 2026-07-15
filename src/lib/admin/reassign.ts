"use client";

import type { TicketStatus } from "@/lib/types";
import { getAllTicketRecords, getTicketDetail } from "@/lib/support/ticketService";
import { saveStoredDetail } from "@/lib/store/ticketStore";
import { applyAssignment, applyReassignTeam } from "@/lib/support/statusTransitions";
import { currentAdmin } from "@/lib/roles/roles";

const ACTIVE: TicketStatus[] = ["Open", "Assigned", "In Progress", "Waiting for Employee"];

/** Reassign a member's active tickets to another member. Returns the count moved. */
export function reassignMemberTickets(fromName: string, to: { name: string; id: string }): number {
  const now = new Date().toISOString();
  const rows = getAllTicketRecords().filter((t) => t.assignedAgent === fromName && ACTIVE.includes(t.status));
  for (const r of rows) {
    const detail = getTicketDetail(r.id);
    if (!detail) continue;
    saveStoredDetail(applyAssignment(detail, { agentName: to.name, agentId: to.id, actorName: currentAdmin.name }, now));
  }
  return rows.length;
}

/** Reassign a team's active tickets to another team (e.g. during deactivation). */
export function reassignTeamTickets(fromTicketTeam: string, toTicketTeam: string, reason: string): number {
  const now = new Date().toISOString();
  const rows = getAllTicketRecords().filter((t) => t.assignedTeam === fromTicketTeam && ACTIVE.includes(t.status));
  for (const r of rows) {
    const detail = getTicketDetail(r.id);
    if (!detail) continue;
    saveStoredDetail(applyReassignTeam(detail, { newTeam: toTicketTeam, actorName: currentAdmin.name, reason }, now));
  }
  return rows.length;
}
