import type { DemoRole, Employee } from "@/lib/types";

/** Prototype-only persisted selection of the demo role. */
export const ROLE_STORAGE_KEY = "heizen.people.demoRole";

export function getStoredRole(): DemoRole {
  if (typeof window === "undefined") return "employee";
  try {
    const raw = window.localStorage.getItem(ROLE_STORAGE_KEY);
    return raw === "agent" || raw === "admin" ? raw : "employee";
  } catch {
    return "employee";
  }
}

export function setStoredRole(role: DemoRole): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ROLE_STORAGE_KEY, role);
  } catch {
    // Storage may be unavailable — ignore.
  }
}

/** The support team the demo agent belongs to (scopes all agent views). */
export const AGENT_TEAM = "People Operations";

/** The mock signed-in support agent. */
export const currentAgent: Employee = {
  id: "AGT-001",
  name: "Ananya Sharma",
  firstName: "Ananya",
  department: "People Operations",
  role: "Support Agent",
  email: "ananya.sharma@heizen.work",
  initials: "AS",
};

/** The mock signed-in admin (organization-wide access). */
export const currentAdmin: Employee = {
  id: "ADM-001",
  name: "Neha Kapoor",
  firstName: "Neha",
  department: "People Operations",
  role: "Admin",
  email: "neha.kapoor@heizen.work",
  initials: "NK",
};

export interface RoleOption {
  value: DemoRole;
  label: string;
  /** Home route entered when this role is selected. */
  home: string;
  disabled?: boolean;
  disabledNote?: string;
}

/** Options shown in the discreet "View as" prototype switcher. */
export const ROLE_OPTIONS: RoleOption[] = [
  { value: "employee", label: "Employee", home: "/support" },
  { value: "agent", label: "Support Agent", home: "/agent/dashboard" },
  { value: "admin", label: "Admin", home: "/admin/dashboard" },
];

/** All support teams the admin can see across the organization. */
export const ORG_TEAMS = [
  "People Operations",
  "Payroll Team",
  "IT Team",
  "Administration",
  "Compliance Team",
];
