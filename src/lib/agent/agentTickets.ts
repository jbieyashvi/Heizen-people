import type { AgentTicket, TicketRecord, TicketStatus } from "@/lib/types";
import { getTeamTicketRecords } from "@/lib/support/ticketService";
import { computeSla, isActiveSla } from "@/lib/agent/sla";
import { PEOPLE_OPS_AGENTS, getPeopleOpsAgents } from "@/lib/agent/team";

/** Statuses that represent active agent work. */
export const ACTIVE_STATUSES: TicketStatus[] = ["Open", "Assigned", "In Progress"];

export function isActiveStatus(status: TicketStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

/** People Operations agents (for workload distribution). */
export const AGENT_TEAM_MEMBERS = PEOPLE_OPS_AGENTS;

const AGENT_ENGAGED: TicketStatus[] = ["In Progress", "Waiting for Employee", "Resolved", "Closed"];

/** Enrich a shared record with SLA + activity metadata for the agent view. */
export function buildAgentTicket(record: TicketRecord, nowIso: string): AgentTicket {
  const sla = computeSla(record, nowIso);
  const created = new Date(record.createdAt).getTime();
  const updated = new Date(record.updatedAt).getTime();
  const firstResponseMs = AGENT_ENGAGED.includes(record.status)
    ? Math.max(0, Math.round((updated - created) * 0.35))
    : null;
  const escalated = sla.state === "breached" && (record.priority === "High" || record.priority === "Critical");
  return { ...record, sla, firstResponseMs, escalated, lastActivityAt: record.lastActivityAt };
}

/** All agent tickets for a team, enriched and ordered by most-recent activity. */
export function getAgentTickets(team: string, nowIso: string): AgentTicket[] {
  return getTeamTicketRecords(team)
    .map((r) => buildAgentTicket(r, nowIso))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/* --------------------------- Dashboard selectors -------------------------- */

export interface AttentionCounts {
  assignedToMe: number;
  unassigned: number;
  dueSoon: number;
  overdue: number;
  highPriority: number;
  waitingForEmployee: number;
}

export function computeAttention(tickets: AgentTicket[], agentName: string): AttentionCounts {
  const active = (t: AgentTicket) => isActiveStatus(t.status);
  return {
    assignedToMe: tickets.filter((t) => t.assignedAgent === agentName && active(t)).length,
    unassigned: tickets.filter((t) => t.assignedAgent === null && active(t)).length,
    dueSoon: tickets.filter((t) => t.sla.state === "approaching").length,
    overdue: tickets.filter((t) => t.sla.state === "breached").length,
    highPriority: tickets.filter(
      (t) => active(t) && (t.priority === "High" || t.priority === "Critical"),
    ).length,
    waitingForEmployee: tickets.filter((t) => t.status === "Waiting for Employee").length,
  };
}

export interface WorkloadMetrics {
  openAssigned: number;
  resolvedToday: number;
  avgFirstResponseMs: number | null;
  slaCompliancePct: number;
}

function sameDay(iso: string, nowIso: string): boolean {
  const a = new Date(iso);
  const b = new Date(nowIso);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function computeWorkload(tickets: AgentTicket[], agentName: string, nowIso: string): WorkloadMetrics {
  const mine = tickets.filter((t) => t.assignedAgent === agentName);
  const openAssigned = mine.filter((t) => isActiveStatus(t.status)).length;
  const resolvedToday = mine.filter((t) => t.status === "Resolved" && sameDay(t.updatedAt, nowIso)).length;

  const responses = mine.map((t) => t.firstResponseMs).filter((v): v is number => v !== null);
  const avgFirstResponseMs =
    responses.length > 0 ? Math.round(responses.reduce((a, b) => a + b, 0) / responses.length) : null;

  const activeSla = mine.filter((t) => isActiveSla(t.sla.state));
  const compliant = activeSla.filter((t) => t.sla.state !== "breached").length;
  const slaCompliancePct = activeSla.length === 0 ? 100 : Math.round((compliant / activeSla.length) * 100);

  return { openAssigned, resolvedToday, avgFirstResponseMs, slaCompliancePct };
}

export interface SlaHealth {
  within: number;
  approaching: number;
  breached: number;
  total: number;
}

export function computeSlaHealth(tickets: AgentTicket[]): SlaHealth {
  const active = tickets.filter((t) => isActiveSla(t.sla.state));
  return {
    within: active.filter((t) => t.sla.state === "within").length,
    approaching: active.filter((t) => t.sla.state === "approaching").length,
    breached: active.filter((t) => t.sla.state === "breached").length,
    total: active.length,
  };
}

const PRIORITY_RANK: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

/** Most urgent active tickets: breached → approaching → high priority → recent. */
export function computeWorklist(tickets: AgentTicket[], limit = 8): AgentTicket[] {
  const active = tickets.filter((t) => isActiveStatus(t.status));
  const rank = (t: AgentTicket) => {
    if (t.sla.state === "breached") return 0;
    if (t.sla.state === "approaching") return 1;
    if (t.priority === "Critical" || t.priority === "High") return 2;
    return 3;
  };
  return [...active]
    .sort((a, b) => {
      const r = rank(a) - rank(b);
      if (r !== 0) return r;
      const p = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (p !== 0) return p;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    })
    .slice(0, limit);
}

export interface RecentActivityItem {
  id: string;
  ticketId: string;
  description: string;
  employeeName: string;
  at: string;
}

function activityLabel(t: AgentTicket): string {
  if (t.sla.state === "breached") return "SLA breached";
  switch (t.status) {
    case "Resolved":
      return "Ticket resolved";
    case "Closed":
      return "Ticket closed";
    case "Waiting for Employee":
      return "Waiting for employee response";
    case "In Progress":
      return "Status changed to In Progress";
    case "Assigned":
      return "Ticket assigned";
    default:
      return "Ticket created";
  }
}

export function computeRecentActivity(tickets: AgentTicket[], limit = 6): RecentActivityItem[] {
  return [...tickets]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit)
    .map((t) => ({
      id: `${t.id}-act`,
      ticketId: t.id,
      description: activityLabel(t),
      employeeName: t.employeeName,
      at: t.updatedAt,
    }));
}

export interface TeamMemberWorkload {
  name: string;
  initials: string;
  active: number;
  dueSoon: number;
  /** available | balanced | heavy */
  load: "available" | "balanced" | "heavy";
}

export function computeTeamWorkload(tickets: AgentTicket[]): TeamMemberWorkload[] {
  return getPeopleOpsAgents().map((m) => {
    const theirs = tickets.filter((t) => t.assignedAgent === m.name);
    const active = theirs.filter((t) => isActiveStatus(t.status)).length;
    const dueSoon = theirs.filter(
      (t) => t.sla.state === "approaching" || t.sla.state === "breached",
    ).length;
    const load: TeamMemberWorkload["load"] = active >= 4 ? "heavy" : active >= 2 ? "balanced" : "available";
    return { name: m.name, initials: m.initials, active, dueSoon, load };
  });
}
