import type { TicketStatus } from "@/lib/types";

/**
 * Single source of truth for ticket status presentation.
 *
 * `label` is the internal status. `employeeLabel` is what the signed-in
 * employee sees (e.g. "Waiting for Employee" surfaces as "Waiting for You").
 * `badge` holds the subtle badge styling; `needsEmployeeAction` marks the
 * status that requires the employee to respond.
 */
export interface StatusMeta {
  label: TicketStatus;
  employeeLabel: string;
  /** URL-friendly slug used in query params. */
  slug: string;
  /** Subtle badge classes — soft border + tint, readable text. */
  badge: string;
  needsEmployeeAction?: boolean;
}

/** Display order used by the summary bar and status sorting. */
export const STATUS_ORDER: TicketStatus[] = [
  "Open",
  "Assigned",
  "In Progress",
  "Waiting for Employee",
  "Resolved",
  "Closed",
];

export const STATUS_META: Record<TicketStatus, StatusMeta> = {
  Open: {
    label: "Open",
    employeeLabel: "Open",
    slug: "open",
    badge: "border-slate-200 bg-slate-50 text-slate-700",
  },
  Assigned: {
    label: "Assigned",
    employeeLabel: "Assigned",
    slug: "assigned",
    badge: "border-indigo-100 bg-indigo-50 text-indigo-700",
  },
  "In Progress": {
    label: "In Progress",
    employeeLabel: "In Progress",
    slug: "in-progress",
    badge: "border-heizen-200 bg-heizen-50 text-heizen-700",
  },
  "Waiting for Employee": {
    label: "Waiting for Employee",
    employeeLabel: "Waiting for You",
    slug: "waiting",
    badge: "border-amber-300 bg-amber-50 text-amber-800",
    needsEmployeeAction: true,
  },
  Resolved: {
    label: "Resolved",
    employeeLabel: "Resolved",
    slug: "resolved",
    badge: "border-emerald-100 bg-emerald-50 text-emerald-700",
  },
  Closed: {
    label: "Closed",
    employeeLabel: "Closed",
    slug: "closed",
    badge: "border-slate-200 bg-slate-100 text-slate-500",
  },
};

/** Employee-facing label for a status. */
export function employeeStatusLabel(status: TicketStatus): string {
  return STATUS_META[status].employeeLabel;
}

const SLUG_TO_STATUS: Record<string, TicketStatus> = Object.values(STATUS_META).reduce(
  (acc, meta) => {
    acc[meta.slug] = meta.label;
    return acc;
  },
  {} as Record<string, TicketStatus>,
);

/** Resolve a status slug (e.g. "waiting") to its internal status, or null. */
export function statusFromSlug(slug: string | null | undefined): TicketStatus | null {
  if (!slug) return null;
  return SLUG_TO_STATUS[slug] ?? null;
}

export function statusToSlug(status: TicketStatus): string {
  return STATUS_META[status].slug;
}

/** Numeric rank for status sorting (matches display order). */
export function statusRank(status: TicketStatus): number {
  return STATUS_ORDER.indexOf(status);
}
