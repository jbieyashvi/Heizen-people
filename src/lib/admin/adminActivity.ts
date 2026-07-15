"use client";

import { currentAdmin } from "@/lib/roles/roles";

export interface AdminActivityEvent {
  id: string;
  action: string;
  admin: string;
  entity: string;
  at: string;
}

const KEY = "heizen.people.adminActivity.v1";

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `aa-${crypto.randomUUID()}`;
  return `aa-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
}

export function getAdminActivity(): AdminActivityEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as AdminActivityEvent[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Record an admin configuration event (newest first). */
export function addAdminActivity(action: string, entity: string): void {
  if (typeof window === "undefined") return;
  try {
    const event: AdminActivityEvent = { id: uid(), action, admin: currentAdmin.name, entity, at: new Date().toISOString() };
    window.localStorage.setItem(KEY, JSON.stringify([event, ...getAdminActivity()]));
  } catch {
    // ignore
  }
}

/** Activity entries for a specific entity (department/team name). */
export function getActivityForEntity(entity: string): AdminActivityEvent[] {
  return getAdminActivity().filter((e) => e.entity === entity);
}
