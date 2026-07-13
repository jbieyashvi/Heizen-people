import type { StoredTicket } from "@/lib/types";
import { recentTickets } from "@/lib/data/tickets";

const STORAGE_KEY = "heizen.people.tickets.v1";

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

function suffixOf(id: string): number {
  const match = id.match(/(\d+)$/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

/** Generate the next realistic ticket ID, e.g. HSC-2026-000319. */
export function generateTicketId(): string {
  const seedMax = recentTickets.reduce((max, t) => Math.max(max, suffixOf(t.id)), 0);
  const storedMax = getStoredTickets().reduce((max, t) => Math.max(max, suffixOf(t.id)), 0);
  const next = Math.max(seedMax, storedMax) + 1;
  const year = new Date().getFullYear();
  return `HSC-${year}-${String(next).padStart(6, "0")}`;
}
