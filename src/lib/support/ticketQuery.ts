import type { SortDirection, TicketFilterState, TicketSortKey } from "@/lib/types";
import { DEFAULT_FILTERS } from "@/lib/support/ticketFilters";
import { STATUS_META } from "@/lib/support/statusConfig";
import { TICKET_CATEGORIES } from "@/lib/config/ticketForm";

/** Minimal read interface satisfied by both URLSearchParams and Next's Readonly variant. */
export interface ReadableParams {
  get(key: string): string | null;
}

const VALID_STATUS_SLUGS = new Set(Object.values(STATUS_META).map((m) => m.slug));
const VALID_CATEGORIES = new Set(TICKET_CATEGORIES.map((c) => c.label));
const VALID_PRIORITIES = new Set(["Low", "Medium", "High"]);
const VALID_SORTS = new Set<TicketSortKey>(["createdAt", "updatedAt", "priority", "status"]);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Parse URL query params into a fully-validated filter state (falls back to defaults). */
export function parseFilters(params: ReadableParams): TicketFilterState {
  const status = params.get("status");
  const category = params.get("category");
  const priority = params.get("priority");
  const from = params.get("from");
  const to = params.get("to");
  const sort = params.get("sort") as TicketSortKey | null;
  const dir = params.get("dir") as SortDirection | null;
  const pageRaw = params.get("page");
  const page = pageRaw ? Number.parseInt(pageRaw, 10) : 1;

  return {
    q: params.get("q") ?? "",
    status: status && VALID_STATUS_SLUGS.has(status) ? status : "all",
    category: category && VALID_CATEGORIES.has(category) ? category : "all",
    priority: priority && VALID_PRIORITIES.has(priority) ? priority : "all",
    from: from && DATE_RE.test(from) ? from : "",
    to: to && DATE_RE.test(to) ? to : "",
    sort: sort && VALID_SORTS.has(sort) ? sort : DEFAULT_FILTERS.sort,
    dir: dir === "asc" || dir === "desc" ? dir : DEFAULT_FILTERS.dir,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/** Serialise filter state to a query string, omitting defaults to keep URLs clean. */
export function buildQueryString(f: TicketFilterState): string {
  const params = new URLSearchParams();
  if (f.q.trim()) params.set("q", f.q.trim());
  if (f.status !== "all") params.set("status", f.status);
  if (f.category !== "all") params.set("category", f.category);
  if (f.priority !== "all") params.set("priority", f.priority);
  if (f.from) params.set("from", f.from);
  if (f.to) params.set("to", f.to);
  if (f.sort !== DEFAULT_FILTERS.sort) params.set("sort", f.sort);
  if (f.dir !== DEFAULT_FILTERS.dir) params.set("dir", f.dir);
  if (f.page > 1) params.set("page", String(f.page));
  return params.toString();
}

/** Stable key for comparing two filter states (order-independent). */
export function filtersKey(f: TicketFilterState): string {
  return buildQueryString(f);
}
