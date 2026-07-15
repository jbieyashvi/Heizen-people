"use client";

/**
 * Centralized mock notification records. Agent actions call these helpers so
 * notification creation lives in one place. Internal-only events (internal
 * notes, reassignment, internal escalation) must not notify the employee.
 */

export type NotificationKind =
  | "agent-replied"
  | "status-changed"
  | "priority-changed"
  | "resolved"
  | "closed"
  | "info-requested";

export interface StoredNotification {
  id: string;
  ticketId: string;
  kind: NotificationKind;
  message: string;
  /** Who the notification is for. */
  audience: "employee" | "internal";
  createdAt: string;
}

const KEY = "heizen.people.notifications.v1";

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `n-${crypto.randomUUID()}`;
  return `n-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
}

export function getNotifications(): StoredNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as StoredNotification[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(list: StoredNotification[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Storage may be unavailable — ignore.
  }
}

/** Record a mock notification (portal + email are simulated). */
export function createNotification(
  ticketId: string,
  kind: NotificationKind,
  message: string,
  audience: "employee" | "internal" = "employee",
): void {
  const rec: StoredNotification = {
    id: uid(),
    ticketId,
    kind,
    message,
    audience,
    createdAt: new Date().toISOString(),
  };
  write([rec, ...getNotifications()]);
}
