/**
 * Central People Operations team + agent configuration. Assignment and workload
 * features resolve agents through here so identities are defined in one place.
 */

import { getOrgConfig } from "@/lib/admin/orgStore";

export const AGENT_TEAM = "People Operations";

/** Categories that route to People Operations (ticket routing reminder). */
export const PEOPLE_OPS_CATEGORIES = ["HR", "Leave", "Employment Documents", "General Query"];

export interface TeamAgent {
  id: string;
  name: string;
  initials: string;
  email: string;
}

export const PEOPLE_OPS_AGENTS: TeamAgent[] = [
  { id: "AGT-001", name: "Ananya Sharma", initials: "AS", email: "ananya.sharma@heizen.work" },
  { id: "AGT-002", name: "Rohan Mehta", initials: "RM", email: "rohan.mehta@heizen.work" },
  { id: "AGT-003", name: "Priya Kapoor", initials: "PK", email: "priya.kapoor@heizen.work" },
  { id: "AGT-004", name: "Vikram Singh", initials: "VS", email: "vikram.singh@heizen.work" },
];

/**
 * Assignable People Operations agents, read from the centralized org config so
 * that admin member changes flow through to Assign / Reassign controls. Falls
 * back to the seed list. Active Support Agents + Team Leads are assignable.
 */
export function getPeopleOpsAgents(): TeamAgent[] {
  try {
    const cfg = getOrgConfig();
    const team = cfg.teams.find((t) => t.ticketTeam === AGENT_TEAM && t.status === "Active");
    if (team) {
      const members = cfg.members
        .filter((m) => m.teamId === team.id && m.status === "Active")
        .map((m) => ({ id: m.id, name: m.name, initials: m.initials, email: m.email }));
      if (members.length > 0) return members;
    }
  } catch {
    // fall through to seed
  }
  return PEOPLE_OPS_AGENTS;
}

export function agentByName(name: string | null): TeamAgent | undefined {
  if (!name) return undefined;
  return PEOPLE_OPS_AGENTS.find((a) => a.name === name);
}

export function agentById(id: string | null): TeamAgent | undefined {
  if (!id) return undefined;
  return PEOPLE_OPS_AGENTS.find((a) => a.id === id);
}

export function agentIdForName(name: string | null): string | null {
  return agentByName(name)?.id ?? null;
}

export function initialsForName(name: string): string {
  const known = agentByName(name);
  if (known) return known.initials;
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
