import type {
  SortDirection,
  TicketFilterState,
  TicketPriority,
  TicketRecord,
  TicketSortKey,
  TicketStatus,
} from "@/lib/types";
import { STATUS_ORDER, statusFromSlug, statusRank } from "@/lib/support/statusConfig";

export const PAGE_SIZE = 10;

export const PRIORITY_ORDER: TicketPriority[] = ["Low", "Medium", "High"];

function priorityRank(priority: TicketPriority): number {
  return PRIORITY_ORDER.indexOf(priority);
}

export const DEFAULT_FILTERS: TicketFilterState = {
  q: "",
  status: "all",
  category: "all",
  priority: "all",
  from: "",
  to: "",
  sort: "updatedAt",
  dir: "desc",
  page: 1,
};

/** True when any result-narrowing filter (not sort/page) is active. */
export function hasActiveFilters(f: TicketFilterState): boolean {
  return (
    f.q.trim() !== "" ||
    f.status !== "all" ||
    f.category !== "all" ||
    f.priority !== "all" ||
    f.from !== "" ||
    f.to !== ""
  );
}

/** Filter records by search, status, category, priority and created-date range. */
export function filterTickets(
  records: TicketRecord[],
  f: TicketFilterState,
): TicketRecord[] {
  const query = f.q.trim().toLowerCase();
  const status = statusFromSlug(f.status);
  // Inclusive range; `to` covers the whole day.
  const fromTime = f.from ? new Date(`${f.from}T00:00:00`).getTime() : null;
  const toTime = f.to ? new Date(`${f.to}T23:59:59.999`).getTime() : null;

  return records.filter((r) => {
    if (query) {
      const haystack = `${r.id} ${r.subject}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (status && r.status !== status) return false;
    if (f.category !== "all" && r.category !== f.category) return false;
    if (f.priority !== "all" && r.priority !== f.priority) return false;

    if (fromTime !== null || toTime !== null) {
      const created = new Date(r.createdAt).getTime();
      if (fromTime !== null && created < fromTime) return false;
      if (toTime !== null && created > toTime) return false;
    }
    return true;
  });
}

/** Sort a copy of the records by the given key and direction. */
export function sortTickets(
  records: TicketRecord[],
  sort: TicketSortKey,
  dir: SortDirection,
): TicketRecord[] {
  const factor = dir === "asc" ? 1 : -1;
  return [...records].sort((a, b) => {
    let cmp = 0;
    switch (sort) {
      case "createdAt":
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "updatedAt":
        cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case "priority":
        cmp = priorityRank(a.priority) - priorityRank(b.priority);
        break;
      case "status":
        cmp = statusRank(a.status) - statusRank(b.status);
        break;
    }
    // Stable tiebreak on most-recent update so ordering is deterministic.
    if (cmp === 0) {
      cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    }
    return cmp * factor;
  });
}

/** Filter then sort — the ordered result set before pagination. */
export function applyFilters(
  records: TicketRecord[],
  f: TicketFilterState,
): TicketRecord[] {
  return sortTickets(filterTickets(records, f), f.sort, f.dir);
}

export function totalPages(count: number): number {
  return Math.max(1, Math.ceil(count / PAGE_SIZE));
}

/** Slice the ordered results for the given 1-based page. */
export function paginate(records: TicketRecord[], page: number): TicketRecord[] {
  const start = (page - 1) * PAGE_SIZE;
  return records.slice(start, start + PAGE_SIZE);
}

export interface StatusCounts {
  all: number;
  byStatus: Record<TicketStatus, number>;
}

/** Counts for the summary bar — total plus a tally per status. */
export function computeStatusCounts(records: TicketRecord[]): StatusCounts {
  const byStatus = STATUS_ORDER.reduce(
    (acc, s) => {
      acc[s] = 0;
      return acc;
    },
    {} as Record<TicketStatus, number>,
  );
  for (const r of records) byStatus[r.status] += 1;
  return { all: records.length, byStatus };
}
