import type { AgentTicket, TicketStatus } from "@/lib/types";
import type { Department, OrgConfig, SupportTeam, TeamMember } from "@/lib/admin/orgTypes";

const ACTIVE: TicketStatus[] = ["Open", "Assigned", "In Progress", "Waiting for Employee"];
const isActive = (t: AgentTicket) => ACTIVE.includes(t.status);

function breachedOrAfter(t: AgentTicket): boolean {
  return t.sla.state === "breached" || (t.sla.state === "met" && t.sla.label.toLowerCase().includes("after breach"));
}

export function slaCompliance(rows: AgentTicket[]): number {
  const applicable = rows.filter((t) => t.sla.state !== "paused");
  if (applicable.length === 0) return 100;
  const breached = applicable.filter(breachedOrAfter).length;
  return Math.round(((applicable.length - breached) / applicable.length) * 100);
}

export interface TeamStats {
  total: number;
  active: number;
  dueSoon: number;
  overdue: number;
  unassigned: number;
  sla: number;
}

export function teamStats(tickets: AgentTicket[], ticketTeam: string): TeamStats {
  const rows = tickets.filter((t) => t.assignedTeam === ticketTeam);
  return {
    total: rows.length,
    active: rows.filter(isActive).length,
    dueSoon: rows.filter((t) => t.sla.state === "approaching").length,
    overdue: rows.filter((t) => t.sla.state === "breached").length,
    unassigned: rows.filter((t) => t.assignedAgent === null && isActive(t)).length,
    sla: slaCompliance(rows),
  };
}

export interface DepartmentStats {
  teamsCount: number;
  membersCount: number;
  activeTickets: number;
  overdue: number;
  sla: number;
}

export function departmentStats(config: OrgConfig, tickets: AgentTicket[], dept: Department): DepartmentStats {
  const teams = config.teams.filter((t) => t.departmentId === dept.id);
  const ticketTeams = teams.map((t) => t.ticketTeam);
  const rows = tickets.filter((t) => ticketTeams.includes(t.assignedTeam));
  const memberIds = new Set(teams.map((t) => t.id));
  return {
    teamsCount: teams.length,
    membersCount: config.members.filter((m) => memberIds.has(m.teamId) && m.status === "Active").length,
    activeTickets: rows.filter(isActive).length,
    overdue: rows.filter((t) => t.sla.state === "breached").length,
    sla: slaCompliance(rows),
  };
}

export type WorkloadLevel = "Available" | "Balanced" | "Near Capacity" | "At Capacity";

export function workloadLevel(active: number, capacity: number): WorkloadLevel {
  const ratio = capacity > 0 ? active / capacity : 0;
  if (ratio >= 1) return "At Capacity";
  if (ratio >= 0.75) return "Near Capacity";
  if (ratio >= 0.4) return "Balanced";
  return "Available";
}

export interface MemberStats {
  active: number;
  dueSoon: number;
  overdue: number;
  resolved: number;
  workload: WorkloadLevel;
}

export function memberStats(tickets: AgentTicket[], member: TeamMember): MemberStats {
  const rows = tickets.filter((t) => t.assignedAgent === member.name);
  const active = rows.filter(isActive).length;
  return {
    active,
    dueSoon: rows.filter((t) => t.sla.state === "approaching").length,
    overdue: rows.filter((t) => t.sla.state === "breached").length,
    resolved: rows.filter((t) => t.resolvedAt).length,
    workload: workloadLevel(active, member.capacity),
  };
}

/** Active tickets currently assigned to a member (for removal reassignment). */
export function activeTicketsForMember(tickets: AgentTicket[], memberName: string): AgentTicket[] {
  return tickets.filter((t) => t.assignedAgent === memberName && isActive(t));
}

/** Active tickets routed to a team (for department/team deactivation). */
export function activeTicketsForTeam(tickets: AgentTicket[], ticketTeam: string): AgentTicket[] {
  return tickets.filter((t) => t.assignedTeam === ticketTeam && ACTIVE.includes(t.status));
}

export function membersForTeam(config: OrgConfig, teamId: string): TeamMember[] {
  return config.members.filter((m) => m.teamId === teamId);
}

export function teamsForDepartment(config: OrgConfig, deptId: string): SupportTeam[] {
  return config.teams.filter((t) => t.departmentId === deptId);
}
