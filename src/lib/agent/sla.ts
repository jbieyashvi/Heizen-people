import type { SlaInfo, SlaState, TicketPriority, TicketRecord, TicketStatus } from "@/lib/types";

/** Minimal fields SLA computation needs (satisfied by TicketRecord and TicketDetail). */
export type SlaInput = Pick<
  TicketRecord,
  "status" | "priority" | "createdAt" | "updatedAt" | "resolvedAt" | "closedAt"
>;

/** PRD default resolution targets per priority. */
export interface SlaTarget {
  kind: "days" | "hours";
  value: number;
  label: string;
}

export const SLA_TARGETS: Record<TicketPriority, SlaTarget> = {
  Low: { kind: "days", value: 3, label: "3 business days" },
  Medium: { kind: "days", value: 2, label: "2 business days" },
  High: { kind: "days", value: 1, label: "1 business day" },
  Critical: { kind: "hours", value: 4, label: "4 hours" },
};

/**
 * Centralized SLA prototype settings.
 *
 * PROTOTYPE ASSUMPTION — pending HR/Admin confirmation: the PRD does not confirm
 * whether the SLA clock pauses while a ticket waits on the employee. We assume it
 * does. Keep this here (not scattered through components) so it can be flipped in
 * one place once product confirms.
 */
export const SLA_CONFIG = {
  pauseSlaWhileWaitingForEmployee: true,
};

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** Add whole business days to a date, skipping Saturdays and Sundays. */
function addBusinessDays(start: Date, days: number): Date {
  const d = new Date(start.getTime());
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) added += 1;
  }
  return d;
}

/** SLA due timestamp for a ticket, from creation + its priority target. */
export function computeDueAt(createdAtIso: string, priority: TicketPriority): string {
  const created = new Date(createdAtIso);
  const target = SLA_TARGETS[priority];
  const due =
    target.kind === "hours"
      ? new Date(created.getTime() + target.value * HOUR)
      : addBusinessDays(created, target.value);
  return due.toISOString();
}

/** Statuses that consume SLA time (active work). */
const ACTIVE: TicketStatus[] = ["Open", "Assigned", "In Progress"];

function coarse(ms: number): string {
  const abs = Math.abs(ms);
  if (abs >= 2 * DAY) return `${Math.round(abs / DAY)}d`;
  if (abs >= HOUR) return `${Math.round(abs / HOUR)}h`;
  return `${Math.max(1, Math.round(abs / (60 * 1000)))}m`;
}

function fine(ms: number): string {
  const abs = Math.abs(ms);
  const h = Math.floor(abs / HOUR);
  const m = Math.round((abs % HOUR) / (60 * 1000));
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}

/**
 * Compute SLA state + label for a ticket relative to `nowIso`. Paused while
 * waiting for the employee (per SLA_CONFIG); reports completion vs breach once
 * resolved/closed.
 */
export function computeSla(record: SlaInput, nowIso: string): SlaInfo {
  const now = new Date(nowIso).getTime();
  const dueAt = computeDueAt(record.createdAt, record.priority);
  const dueMs = new Date(dueAt).getTime();

  // Resolved / Closed — compare the resolution time to the due time.
  if (record.status === "Resolved" || record.status === "Closed") {
    const finishedIso = record.resolvedAt ?? record.closedAt ?? record.updatedAt;
    const finished = new Date(finishedIso).getTime();
    const afterBreach = finished > dueMs;
    return {
      state: "met",
      dueAt,
      remainingMs: dueMs - finished,
      label: afterBreach ? "Resolved after breach" : "Completed within SLA",
    };
  }

  // Waiting for the employee — clock paused (prototype setting).
  if (record.status === "Waiting for Employee" && SLA_CONFIG.pauseSlaWhileWaitingForEmployee) {
    return { state: "paused", dueAt, remainingMs: dueMs - now, label: "Paused — Waiting for employee" };
  }

  const remainingMs = dueMs - now;
  if (!ACTIVE.includes(record.status) && record.status !== "Waiting for Employee") {
    return { state: "within", dueAt, remainingMs, label: `${coarse(remainingMs)} remaining` };
  }

  const totalMs = dueMs - new Date(record.createdAt).getTime();
  const approachingThreshold = Math.max(HOUR, totalMs * 0.25);

  if (remainingMs <= 0) {
    return { state: "breached", dueAt, remainingMs, label: `Breached by ${coarse(remainingMs)}` };
  }
  if (remainingMs <= approachingThreshold) {
    return { state: "approaching", dueAt, remainingMs, label: `${fine(remainingMs)} remaining` };
  }
  return { state: "within", dueAt, remainingMs, label: `${coarse(remainingMs)} remaining` };
}

/** Whether an SLA state counts toward "active" SLA health metrics. */
export function isActiveSla(state: SlaState): boolean {
  return state === "within" || state === "approaching" || state === "breached";
}
