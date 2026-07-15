import type { StoredTicket, TicketDetail, TicketPriority, TicketStatus } from "@/lib/types";
import { seedTickets } from "@/lib/data/seedTickets";

const STORAGE_KEY = "heizen.people.tickets.v1";
const DETAILS_KEY = "heizen.people.ticketDetails.v1";

/** Read all locally-persisted tickets (newest first). SSR-safe. */
export function getStoredTickets(): StoredTicket[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredTicket[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredTickets(tickets: StoredTicket[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch {
    // Storage may be unavailable (private mode / quota) — fail silently.
  }
}

/** Persist a newly-created ticket, keeping newest first. */
export function addStoredTicket(ticket: StoredTicket): void {
  const existing = getStoredTickets();
  writeStoredTickets([ticket, ...existing]);
}

/* -------------------------------------------------------------------------- */
/*  Ticket detail persistence (conversation, activity, status changes)          */
/* -------------------------------------------------------------------------- */

/** Read the map of persisted ticket details keyed by ticket id. SSR-safe. */
export function getStoredDetails(): Record<string, TicketDetail> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(DETAILS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, TicketDetail>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/** Persist (create or replace) a single ticket detail. */
export function saveStoredDetail(detail: TicketDetail): void {
  if (typeof window === "undefined") return;
  try {
    const all = getStoredDetails();
    all[detail.id] = detail;
    window.localStorage.setItem(DETAILS_KEY, JSON.stringify(all));
  } catch {
    // Fail silently — storage may be unavailable.
  }
}

export interface DetailOverride {
  status: TicketStatus;
  updatedAt: string;
  priority?: TicketPriority;
  assignedTeam?: string;
  assignedAgent?: string | null;
  assignedAgentId?: string | null;
  resolvedAt?: string;
  closedAt?: string;
}

/**
 * Overrides derived from persisted details, so lists / dashboard / queues reflect
 * changes made on the details page or via assignment — without a separate store.
 * Older persisted details may lack the newer fields (migration-safe: undefined).
 */
export function getDetailOverrides(): Record<string, DetailOverride> {
  const details = getStoredDetails();
  const out: Record<string, DetailOverride> = {};
  for (const [id, d] of Object.entries(details)) {
    out[id] = {
      status: d.status,
      updatedAt: d.updatedAt,
      priority: d.priority,
      assignedTeam: d.assignedTeam,
      assignedAgent: d.assignedAgent,
      assignedAgentId: d.assignedAgentId,
      resolvedAt: d.resolvedAt,
      closedAt: d.closedAt,
    };
  }
  return out;
}

function suffixOf(id: string): number {
  const match = id.match(/(\d+)$/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

/** Generate the next realistic ticket ID, e.g. HSC-2026-000346. */
export function generateTicketId(): string {
  const seedMax = seedTickets.reduce((max, t) => Math.max(max, suffixOf(t.id)), 0);
  const storedMax = getStoredTickets().reduce((max, t) => Math.max(max, suffixOf(t.id)), 0);
  const next = Math.max(seedMax, storedMax) + 1;
  const year = new Date().getFullYear();
  return `HSC-${year}-${String(next).padStart(6, "0")}`;
}
