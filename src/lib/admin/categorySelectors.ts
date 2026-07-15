import type { Category, RequestType } from "@/lib/admin/categoryTypes";
import { getCategoryConfig } from "@/lib/admin/categoryStore";
import { getOrgConfig } from "@/lib/admin/orgStore";

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

export interface CategoryRouting {
  departmentName: string | null;
  teamName: string | null;
  /** The ticket `assignedTeam` value new tickets route to. */
  ticketTeam: string | null;
  departmentActive: boolean;
  teamActive: boolean;
  configured: boolean;
}

/** Resolve a category's routing from the centralized org config. */
export function resolveRouting(category: Pick<Category, "departmentId" | "teamId">): CategoryRouting {
  const org = getOrgConfig();
  const dept = org.departments.find((d) => d.id === category.departmentId);
  const team = org.teams.find((t) => t.id === category.teamId);
  return {
    departmentName: dept?.name ?? null,
    teamName: team?.name ?? null,
    ticketTeam: team?.ticketTeam ?? null,
    departmentActive: dept?.status === "Active",
    teamActive: team?.status === "Active",
    configured: !!dept && !!team,
  };
}

export function categoryHasMissingRouting(category: Category): boolean {
  const r = resolveRouting(category);
  return !r.configured;
}

/** All categories ordered by display order (admin view). */
export function getAllCategories(): Category[] {
  return [...getCategoryConfig().categories].sort(byOrder);
}

export function getCategoryById(id: string): Category | null {
  return getCategoryConfig().categories.find((c) => c.id === id) ?? null;
}

/** Active + visible request types for a category, ordered (employee-facing). */
export function visibleRequestTypes(category: Category): RequestType[] {
  return [...category.requestTypes].filter((rt) => rt.status === "Active" && rt.visibility === "Visible").sort(byOrder);
}

/**
 * Categories shown to employees: Active + Visible, valid routing (active dept +
 * team), ordered. Used by the dashboard and Raise New Ticket form.
 */
export function getEmployeeCategories(): Category[] {
  return getAllCategories().filter((c) => {
    if (c.status !== "Active" || c.visibility !== "Visible") return false;
    const r = resolveRouting(c);
    return r.configured && r.departmentActive && r.teamActive;
  });
}
