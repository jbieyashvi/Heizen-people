import type { AgentTicket } from "@/lib/types";

export type QueueKey =
  | "my-tickets"
  | "all"
  | "unassigned"
  | "overdue"
  | "high-priority"
  | "recently-updated"
  | "due-soon"
  | "waiting";

export interface QueueDef {
  key: QueueKey;
  label: string;
  /** Header description shown on the queue page. */
  description: string;
  /** Message shown when the queue has no tickets (no filters applied). */
  emptyMessage: string;
}

export const QUEUES: Record<QueueKey, QueueDef> = {
  "my-tickets": {
    key: "my-tickets",
    label: "My Tickets",
    description: "Tickets currently assigned to you.",
    emptyMessage: "No tickets are currently assigned to you.",
  },
  all: {
    key: "all",
    label: "All Tickets",
    description: "All People Operations tickets.",
    emptyMessage: "No People Operations tickets yet.",
  },
  unassigned: {
    key: "unassigned",
    label: "Unassigned",
    description: "New requests waiting for assignment.",
    emptyMessage: "No unassigned tickets. The queue is clear.",
  },
  overdue: {
    key: "overdue",
    label: "Overdue",
    description: "Tickets that have exceeded their SLA target.",
    emptyMessage: "No overdue tickets. All active tickets are within SLA.",
  },
  "high-priority": {
    key: "high-priority",
    label: "High Priority",
    description: "High and Critical priority requests requiring attention.",
    emptyMessage: "No High or Critical priority tickets.",
  },
  "recently-updated": {
    key: "recently-updated",
    label: "Recently Updated",
    description: "People Operations tickets with the latest activity.",
    emptyMessage: "No recent tickets.",
  },
  "due-soon": {
    key: "due-soon",
    label: "Due Soon",
    description: "Tickets approaching their SLA target.",
    emptyMessage: "No tickets are approaching their SLA target.",
  },
  waiting: {
    key: "waiting",
    label: "Waiting for Employee",
    description: "Paused, awaiting the employee.",
    emptyMessage: "No tickets are waiting on the employee.",
  },
};

/** Queues shown in the compact queue navigation (and sidebar), in order. */
export const QUEUE_ORDER: QueueKey[] = [
  "my-tickets",
  "all",
  "unassigned",
  "overdue",
  "high-priority",
  "recently-updated",
];

export const DEFAULT_QUEUE: QueueKey = "all";

export function isQueueKey(value: string | null): value is QueueKey {
  return value !== null && value in QUEUES;
}

export function resolveQueue(value: string | null): QueueKey {
  return isQueueKey(value) ? value : DEFAULT_QUEUE;
}

/**
 * These queues hide Closed tickets by default; Closed appears only when the
 * Status filter explicitly selects it.
 */
export function queueHidesClosedByDefault(key: QueueKey): boolean {
  return key === "my-tickets" || key === "high-priority";
}

/** Base cohort for a queue (structural membership, before user filters). */
export function filterQueue(tickets: AgentTicket[], key: QueueKey, agentName: string): AgentTicket[] {
  switch (key) {
    case "my-tickets":
      return tickets.filter((t) => t.assignedAgent === agentName);
    case "unassigned":
      return tickets.filter(
        (t) => t.assignedAgent === null && t.status !== "Resolved" && t.status !== "Closed",
      );
    case "overdue":
      return tickets.filter((t) => t.sla.state === "breached");
    case "due-soon":
      return tickets.filter((t) => t.sla.state === "approaching");
    case "high-priority":
      return tickets.filter((t) => t.priority === "High" || t.priority === "Critical");
    case "waiting":
      return tickets.filter((t) => t.status === "Waiting for Employee");
    case "recently-updated":
    case "all":
    default:
      return tickets;
  }
}

/**
 * Default-view membership: queue cohort with the closed-by-default rule applied.
 * Used for the navigation counts (no user filters).
 */
export function queueDefaultMembers(
  tickets: AgentTicket[],
  key: QueueKey,
  agentName: string,
): AgentTicket[] {
  const base = filterQueue(tickets, key, agentName);
  return queueHidesClosedByDefault(key) ? base.filter((t) => t.status !== "Closed") : base;
}

export function countForQueue(tickets: AgentTicket[], key: QueueKey, agentName: string): number {
  return queueDefaultMembers(tickets, key, agentName).length;
}
