import type { AgentTicket, SlaState, TicketPriority } from "@/lib/types";
import { STATUS_ORDER } from "@/lib/support/statusConfig";
import { QueueKey, queueHidesClosedByDefault } from "@/lib/agent/queues";

export const PAGE_SIZE = 10;

export type AgentSortKey = "created" | "updated" | "priority" | "status" | "sla";

export interface AgentFilterState {
  q: string;
  status: string; // "all" | TicketStatus
  category: string; // "all" | label
  priority: string; // "all" | TicketPriority
  agent: string; // "all" | "unassigned" | agent name
  sla: string; // "all" | SlaState
  createdFrom: string;
  createdTo: string;
  updatedFrom: string;
  updatedTo: string;
  /** "" means "use the queue's default sort". */
  sort: AgentSortKey | "";
  dir: "asc" | "desc";
  page: number;
}

export const DEFAULT_FILTERS: AgentFilterState = {
  q: "",
  status: "all",
  category: "all",
  priority: "all",
  agent: "all",
  sla: "all",
  createdFrom: "",
  createdTo: "",
  updatedFrom: "",
  updatedTo: "",
  sort: "",
  dir: "desc",
  page: 1,
};

const PRIORITY_RANK: Record<TicketPriority, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

/* ------------------------------ URL parsing -------------------------------- */

interface Readable {
  get(key: string): string | null;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SORTS: AgentSortKey[] = ["created", "updated", "priority", "status", "sla"];

export function parseFilters(p: Readable): AgentFilterState {
  const date = (k: string) => {
    const v = p.get(k);
    return v && DATE_RE.test(v) ? v : "";
  };
  const sortRaw = p.get("sort");
  const sort = SORTS.includes(sortRaw as AgentSortKey) ? (sortRaw as AgentSortKey) : "";
  const dir = p.get("dir") === "asc" ? "asc" : "desc";
  const pageRaw = Number.parseInt(p.get("page") ?? "1", 10);

  return {
    q: p.get("q") ?? "",
    status: p.get("status") ?? "all",
    category: p.get("category") ?? "all",
    priority: p.get("priority") ?? "all",
    agent: p.get("agent") ?? "all",
    sla: p.get("sla") ?? "all",
    createdFrom: date("cfrom"),
    createdTo: date("cto"),
    updatedFrom: date("ufrom"),
    updatedTo: date("uto"),
    sort,
    dir,
    page: Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1,
  };
}

/** Build a query string that always keeps the queue, plus non-default filters. */
export function buildQueryString(queue: QueueKey, f: AgentFilterState): string {
  const p = new URLSearchParams();
  p.set("queue", queue);
  if (f.q.trim()) p.set("q", f.q.trim());
  if (f.status !== "all") p.set("status", f.status);
  if (f.category !== "all") p.set("category", f.category);
  if (f.priority !== "all") p.set("priority", f.priority);
  if (f.agent !== "all") p.set("agent", f.agent);
  if (f.sla !== "all") p.set("sla", f.sla);
  if (f.createdFrom) p.set("cfrom", f.createdFrom);
  if (f.createdTo) p.set("cto", f.createdTo);
  if (f.updatedFrom) p.set("ufrom", f.updatedFrom);
  if (f.updatedTo) p.set("uto", f.updatedTo);
  if (f.sort) p.set("sort", f.sort);
  if (f.sort && f.dir !== "desc") p.set("dir", f.dir);
  if (f.page > 1) p.set("page", String(f.page));
  return p.toString();
}

export function activeFilterCount(f: AgentFilterState): number {
  let n = 0;
  if (f.q.trim()) n += 1;
  if (f.status !== "all") n += 1;
  if (f.category !== "all") n += 1;
  if (f.priority !== "all") n += 1;
  if (f.agent !== "all") n += 1;
  if (f.sla !== "all") n += 1;
  if (f.createdFrom || f.createdTo) n += 1;
  if (f.updatedFrom || f.updatedTo) n += 1;
  return n;
}

export function hasActiveFilters(f: AgentFilterState): boolean {
  return activeFilterCount(f) > 0;
}

/* ------------------------------ Filtering ---------------------------------- */

function inRange(iso: string, from: string, to: string): boolean {
  const t = new Date(iso).getTime();
  if (from && t < new Date(`${from}T00:00:00`).getTime()) return false;
  if (to && t > new Date(`${to}T23:59:59.999`).getTime()) return false;
  return true;
}

/** Apply the user filter toolbar to a queue's base cohort. */
export function applyFilters(
  cohort: AgentTicket[],
  f: AgentFilterState,
  queue: QueueKey,
): AgentTicket[] {
  const q = f.q.trim().toLowerCase();

  let rows = cohort.filter((t) => {
    if (q) {
      const hay = `${t.id} ${t.employeeName} ${t.subject}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (f.status !== "all" && t.status !== f.status) return false;
    if (f.category !== "all" && t.category !== f.category) return false;
    if (f.priority !== "all" && t.priority !== f.priority) return false;
    if (f.agent === "unassigned") {
      if (t.assignedAgent !== null) return false;
    } else if (f.agent !== "all" && t.assignedAgent !== f.agent) {
      return false;
    }
    if (f.sla !== "all" && t.sla.state !== (f.sla as SlaState)) return false;
    if ((f.createdFrom || f.createdTo) && !inRange(t.createdAt, f.createdFrom, f.createdTo)) return false;
    if ((f.updatedFrom || f.updatedTo) && !inRange(t.updatedAt, f.updatedFrom, f.updatedTo)) return false;
    return true;
  });

  // Closed hidden by default on some queues unless the status filter includes it.
  if (f.status === "all" && queueHidesClosedByDefault(queue)) {
    rows = rows.filter((t) => t.status !== "Closed");
  }
  return rows;
}

/* ------------------------------- Sorting ----------------------------------- */

const time = (iso: string) => new Date(iso).getTime();

/** Queue-specific default ordering (used when no manual sort is chosen). */
export function defaultSort(rows: AgentTicket[], queue: QueueKey): AgentTicket[] {
  const copy = [...rows];
  switch (queue) {
    case "unassigned":
      return copy.sort((a, b) => time(a.createdAt) - time(b.createdAt)); // oldest first
    case "overdue":
      return copy.sort((a, b) => a.sla.remainingMs - b.sla.remainingMs); // most breached first
    case "high-priority":
      return copy.sort(
        (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || time(b.updatedAt) - time(a.updatedAt),
      );
    case "my-tickets": {
      const rank = (t: AgentTicket) =>
        t.sla.state === "breached" ? 0 : t.sla.state === "approaching" ? 1 : PRIORITY_RANK[t.priority] <= 1 ? 2 : 3;
      return copy.sort(
        (a, b) => rank(a) - rank(b) || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || time(b.updatedAt) - time(a.updatedAt),
      );
    }
    case "recently-updated":
    case "all":
    default:
      return copy.sort((a, b) => time(b.updatedAt) - time(a.updatedAt));
  }
}

export function manualSort(rows: AgentTicket[], key: AgentSortKey, dir: "asc" | "desc"): AgentTicket[] {
  const factor = dir === "asc" ? 1 : -1;
  const copy = [...rows];
  copy.sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case "created":
        cmp = time(a.createdAt) - time(b.createdAt);
        break;
      case "updated":
        cmp = time(a.updatedAt) - time(b.updatedAt);
        break;
      case "priority":
        cmp = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
        break;
      case "status":
        cmp = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
        break;
      case "sla":
        cmp = a.sla.remainingMs - b.sla.remainingMs;
        break;
    }
    if (cmp === 0) cmp = time(a.updatedAt) - time(b.updatedAt);
    return cmp * factor;
  });
  return copy;
}

export function sortRows(rows: AgentTicket[], f: AgentFilterState, queue: QueueKey): AgentTicket[] {
  return f.sort ? manualSort(rows, f.sort, f.dir) : defaultSort(rows, queue);
}

/* ------------------------------ Pagination --------------------------------- */

export function totalPages(count: number): number {
  return Math.max(1, Math.ceil(count / PAGE_SIZE));
}

export function paginate(rows: AgentTicket[], page: number): AgentTicket[] {
  const start = (page - 1) * PAGE_SIZE;
  return rows.slice(start, start + PAGE_SIZE);
}
