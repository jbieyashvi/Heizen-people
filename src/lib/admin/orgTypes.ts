export type EntityStatus = "Active" | "Inactive";
export type MemberRole = "Support Agent" | "Team Lead";
export type Availability = "Available" | "Limited" | "Unavailable";

/** A support/service department responsible for employee requests. */
export interface Department {
  id: string;
  name: string;
  /** Uppercase, unique code. */
  code: string;
  description: string;
  lead: string;
  supportEmail: string;
  status: EntityStatus;
  /** Ticket category labels handled by this department. */
  categories: string[];
}

/** A support team inside a department. */
export interface SupportTeam {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  /**
   * The ticket `assignedTeam` value this team maps to — keeps existing ticket
   * data valid when team display names differ from routing names.
   */
  ticketTeam: string;
  lead: string;
  description: string;
  supportEmail: string;
  status: EntityStatus;
}

/** A member of a support team. */
export interface TeamMember {
  id: string;
  teamId: string;
  name: string;
  email: string;
  initials: string;
  role: MemberRole;
  availability: Availability;
  /** Maximum concurrent tickets the member should hold. */
  capacity: number;
  status: EntityStatus;
}

/** The full organization configuration (departments, teams, members). */
export interface OrgConfig {
  departments: Department[];
  teams: SupportTeam[];
  members: TeamMember[];
}
