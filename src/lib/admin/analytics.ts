import type { AgentTicket, TicketStatus } from "@/lib/types";
import { STATUS_ORDER } from "@/lib/support/statusConfig";
import { ORG_TEAMS } from "@/lib/roles/roles";
import type { Bucket } from "@/lib/admin/dateRange";

export const ADMIN_CATEGORIES = [
  "HR",
  "Payroll",
  "Leave",
  "IT Support",
  "Administration",
  "Assets",
  "Compliance",
  "Employment Documents",
  "General Query",
];

const ACTIVE: TicketStatus[] = ["Open", "Assigned", "In Progress", "Waiting for Employee"];
const isActive = (t: AgentTicket) => ACTIVE.includes(t.status);
const inWindow = (iso: string | undefined, from: string, to: string) =>
  !!iso && new Date(iso).getTime() >= new Date(from).getTime() && new Date(iso).getTime() <= new Date(to).getTime();

function breachedOrAfter(t: AgentTicket): boolean {
  return t.sla.state === "breached" || (t.sla.state === "met" && t.sla.label.toLowerCase().includes("after breach"));
}

export interface AdminFilterValues {
  from: string;
  to: string;
  team: string; // "all" | team
  category: string; // "all" | category
}

/** Filter by created-date range + optional team + optional category. */
export function filterTickets(tickets: AgentTicket[], f: AdminFilterValues): AgentTicket[] {
  return tickets.filter((t) => {
    if (!inWindow(t.createdAt, f.from, f.to)) return false;
    if (f.team !== "all" && t.assignedTeam !== f.team) return false;
    if (f.category !== "all" && t.category !== f.category) return false;
    return true;
  });
}

/* --------------------------------- KPIs ----------------------------------- */

export interface Delta {
  pct: number;
  direction: "up" | "down" | "flat";
}

function delta(cur: number, prev: number): Delta {
  if (prev === 0) return { pct: cur > 0 ? 100 : 0, direction: cur > 0 ? "up" : "flat" };
  const pct = Math.round(((cur - prev) / prev) * 100);
  return { pct: Math.abs(pct), direction: pct > 0 ? "up" : pct < 0 ? "down" : "flat" };
}

function avgResolutionMs(set: AgentTicket[]): number | null {
  const resolved = set.filter((t) => t.resolvedAt);
  if (resolved.length === 0) return null;
  const sum = resolved.reduce((a, t) => a + (new Date(t.resolvedAt!).getTime() - new Date(t.createdAt).getTime()), 0);
  return Math.round(sum / resolved.length);
}

function slaCompliancePct(set: AgentTicket[]): number {
  const applicable = set.filter((t) => t.sla.state !== "paused");
  if (applicable.length === 0) return 100;
  const breached = applicable.filter(breachedOrAfter).length;
  return Math.round(((applicable.length - breached) / applicable.length) * 100);
}

export interface TopMetrics {
  total: number;
  open: number;
  resolved: number;
  avgResolutionMs: number | null;
  slaCompliancePct: number;
  deltas: { total: Delta; open: Delta; resolved: Delta; avgResolution: Delta; sla: Delta };
}

export function computeTopMetrics(base: AgentTicket[], prev: AgentTicket[]): TopMetrics {
  const total = base.length;
  const open = base.filter(isActive).length;
  const resolved = base.filter((t) => t.resolvedAt).length;
  const avg = avgResolutionMs(base);
  const sla = slaCompliancePct(base);

  const pAvg = avgResolutionMs(prev);
  return {
    total,
    open,
    resolved,
    avgResolutionMs: avg,
    slaCompliancePct: sla,
    deltas: {
      total: delta(total, prev.length),
      open: delta(open, prev.filter(isActive).length),
      resolved: delta(resolved, prev.filter((t) => t.resolvedAt).length),
      avgResolution: delta(avg ?? 0, pAvg ?? 0),
      sla: delta(sla, slaCompliancePct(prev)),
    },
  };
}

/* --------------------------- Status distribution -------------------------- */

export interface StatusSlice {
  status: TicketStatus;
  count: number;
  pct: number;
}

export function computeStatusDistribution(base: AgentTicket[]): StatusSlice[] {
  const total = base.length;
  return STATUS_ORDER.map((status) => {
    const count = base.filter((t) => t.status === status).length;
    return { status, count, pct: total === 0 ? 0 : Math.round((count / total) * 100) };
  });
}

/* ------------------------------ Volume trend ------------------------------ */

export interface TrendPoint {
  label: string;
  created: number;
  resolved: number;
}

export function computeVolumeTrend(base: AgentTicket[], buckets: Bucket[]): TrendPoint[] {
  return buckets.map((b) => ({
    label: b.label,
    created: base.filter((t) => inWindow(t.createdAt, b.start, b.end)).length,
    resolved: base.filter((t) => inWindow(t.resolvedAt, b.start, b.end)).length,
  }));
}

/* ---------------------------- Department stats ---------------------------- */

export interface DepartmentStat {
  team: string;
  total: number;
  open: number;
  overdue: number;
  slaCompliance: number;
}

export function computeDepartmentStats(deptSet: AgentTicket[]): DepartmentStat[] {
  return ORG_TEAMS.map((team) => {
    const rows = deptSet.filter((t) => t.assignedTeam === team);
    return {
      team,
      total: rows.length,
      open: rows.filter(isActive).length,
      overdue: rows.filter((t) => t.sla.state === "breached").length,
      slaCompliance: slaCompliancePct(rows),
    };
  });
}

/* ----------------------------- SLA performance ---------------------------- */

export interface SlaPerformance {
  within: number;
  approaching: number;
  breached: number;
  completedWithin: number;
  resolvedAfterBreach: number;
  total: number;
  overallPct: number;
  overallDelta: Delta;
}

function slaBreakdown(set: AgentTicket[]) {
  let within = 0, approaching = 0, breached = 0, completedWithin = 0, resolvedAfterBreach = 0;
  for (const t of set) {
    if (t.sla.state === "within") within += 1;
    else if (t.sla.state === "approaching") approaching += 1;
    else if (t.sla.state === "breached") breached += 1;
    else if (t.sla.state === "met") {
      if (t.sla.label.toLowerCase().includes("after breach")) resolvedAfterBreach += 1;
      else completedWithin += 1;
    }
  }
  return { within, approaching, breached, completedWithin, resolvedAfterBreach };
}

export function computeSlaPerformance(base: AgentTicket[], prev: AgentTicket[]): SlaPerformance {
  const b = slaBreakdown(base);
  const total = base.filter((t) => t.sla.state !== "paused").length;
  const overallPct = slaCompliancePct(base);
  return {
    ...b,
    total,
    overallPct,
    overallDelta: delta(overallPct, slaCompliancePct(prev)),
  };
}

/* ---------------------------- Category ranking ---------------------------- */

export interface CategoryStat {
  category: string;
  count: number;
  pct: number;
  trend: Delta;
}

export function computeCategoryRanking(catSet: AgentTicket[], prev: AgentTicket[]): CategoryStat[] {
  const total = catSet.length;
  return ADMIN_CATEGORIES.map((category) => {
    const count = catSet.filter((t) => t.category === category).length;
    const prevCount = prev.filter((t) => t.category === category).length;
    return { category, count, pct: total === 0 ? 0 : Math.round((count / total) * 100), trend: delta(count, prevCount) };
  })
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);
}

/* --------------------------- Team performance ----------------------------- */

export interface TeamPerformance {
  team: string;
  active: number;
  resolved: number;
  avgResolutionMs: number | null;
  slaCompliance: number;
  overdue: number;
}

export function computeTeamPerformance(deptSet: AgentTicket[]): TeamPerformance[] {
  return ORG_TEAMS.map((team) => {
    const rows = deptSet.filter((t) => t.assignedTeam === team);
    return {
      team,
      active: rows.filter(isActive).length,
      resolved: rows.filter((t) => t.resolvedAt).length,
      avgResolutionMs: avgResolutionMs(rows),
      slaCompliance: slaCompliancePct(rows),
      overdue: rows.filter((t) => t.sla.state === "breached").length,
    };
  });
}

/* ------------------------- Tickets requiring attention -------------------- */

const UNASSIGNED_AGE_DAYS = 2;

export function computeAttention(base: AgentTicket[], nowIso: string, limit = 8): AgentTicket[] {
  const now = new Date(nowIso).getTime();
  const flagged = base.filter((t) => {
    if (t.sla.state === "breached") return true;
    if (t.priority === "Critical" && isActive(t)) return true;
    if (t.priority === "High" && t.sla.state === "approaching") return true;
    const ageDays = (now - new Date(t.createdAt).getTime()) / (24 * 60 * 60 * 1000);
    if (t.assignedAgent === null && isActive(t) && ageDays > UNASSIGNED_AGE_DAYS) return true;
    return false;
  });
  const rank = (t: AgentTicket) =>
    t.sla.state === "breached" ? 0 : t.priority === "Critical" ? 1 : t.sla.state === "approaching" ? 2 : 3;
  return flagged
    .sort((a, b) => rank(a) - rank(b) || a.sla.remainingMs - b.sla.remainingMs)
    .slice(0, limit);
}

/* ---------------------------- Recent activity ----------------------------- */

export interface OperationalActivity {
  id: string;
  ticketId: string;
  event: string;
  team: string;
  by: string;
  at: string;
}

function eventFor(t: AgentTicket): string {
  if (t.escalated) return "Ticket escalated";
  if (t.sla.state === "breached") return "SLA breached";
  switch (t.status) {
    case "Resolved": return "Ticket resolved";
    case "Closed": return "Ticket closed";
    case "Waiting for Employee": return "Waiting for employee";
    case "In Progress": return "Status changed to In Progress";
    case "Assigned": return "Ticket assigned";
    default: return "Ticket created";
  }
}

export function computeRecentActivity(base: AgentTicket[], limit = 8): OperationalActivity[] {
  return [...base]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit)
    .map((t) => ({
      id: `${t.id}-op`,
      ticketId: t.id,
      event: eventFor(t),
      team: t.assignedTeam,
      by: t.assignedAgent ?? t.employeeName,
      at: t.updatedAt,
    }));
}
