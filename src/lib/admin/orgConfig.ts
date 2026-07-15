import type { OrgConfig } from "@/lib/admin/orgTypes";

/**
 * Seed organization configuration. Kept centralized so departments, teams and
 * members are defined once. Member ids for People Operations match the agent
 * ids used on tickets so assignment stays consistent.
 *
 * `ticketTeam` links each team to the `assignedTeam` value already stored on
 * tickets, so existing ticket data remains valid.
 */
export const SEED_ORG_CONFIG: OrgConfig = {
  departments: [
    { id: "DEP-PEOPLE", name: "People Operations", code: "PEOPLE", description: "Handles HR, leave, employment documents and general employee queries.", lead: "Neha Kapoor", supportEmail: "people.support@heizen.work", status: "Active", categories: ["HR", "Leave", "Employment Documents", "General Query"] },
    { id: "DEP-PAYROLL", name: "Payroll", code: "PAYROLL", description: "Handles salary, payslips, reimbursements and tax queries.", lead: "Arjun Malhotra", supportEmail: "payroll.support@heizen.work", status: "Active", categories: ["Payroll"] },
    { id: "DEP-IT", name: "Information Technology", code: "IT", description: "Handles accounts, access, software and hardware support.", lead: "Karan Shah", supportEmail: "it.support@heizen.work", status: "Active", categories: ["IT Support"] },
    { id: "DEP-ADMIN", name: "Administration", code: "ADMIN", description: "Handles facilities, assets and workplace requests.", lead: "Meera Joshi", supportEmail: "admin.support@heizen.work", status: "Active", categories: ["Administration", "Assets"] },
    { id: "DEP-COMPLIANCE", name: "Compliance", code: "COMPLIANCE", description: "Handles audits, disclosures and policy sign-offs.", lead: "Nikhil Rao", supportEmail: "compliance.support@heizen.work", status: "Active", categories: ["Compliance"] },
  ],
  teams: [
    { id: "TEAM-PEOPLE", name: "People Operations Support", code: "POPS", departmentId: "DEP-PEOPLE", ticketTeam: "People Operations", lead: "Neha Kapoor", description: "Primary People Operations support team.", supportEmail: "people.support@heizen.work", status: "Active" },
    { id: "TEAM-PAY", name: "Payroll Support", code: "PAYS", departmentId: "DEP-PAYROLL", ticketTeam: "Payroll Team", lead: "Arjun Malhotra", description: "Payroll support team.", supportEmail: "payroll.support@heizen.work", status: "Active" },
    { id: "TEAM-IT", name: "IT Support Team", code: "ITS", departmentId: "DEP-IT", ticketTeam: "IT Team", lead: "Karan Shah", description: "IT support team.", supportEmail: "it.support@heizen.work", status: "Active" },
    { id: "TEAM-ADMIN", name: "Administration Support", code: "ADMS", departmentId: "DEP-ADMIN", ticketTeam: "Administration", lead: "Meera Joshi", description: "Administration support team.", supportEmail: "admin.support@heizen.work", status: "Active" },
    { id: "TEAM-COMP", name: "Compliance Support", code: "COMPS", departmentId: "DEP-COMPLIANCE", ticketTeam: "Compliance Team", lead: "Nikhil Rao", description: "Compliance support team.", supportEmail: "compliance.support@heizen.work", status: "Active" },
  ],
  members: [
    // People Operations Support (ids match ticket agent ids)
    { id: "AGT-001", teamId: "TEAM-PEOPLE", name: "Ananya Sharma", email: "ananya.sharma@heizen.work", initials: "AS", role: "Support Agent", availability: "Available", capacity: 15, status: "Active" },
    { id: "AGT-002", teamId: "TEAM-PEOPLE", name: "Rohan Mehta", email: "rohan.mehta@heizen.work", initials: "RM", role: "Support Agent", availability: "Available", capacity: 15, status: "Active" },
    { id: "AGT-003", teamId: "TEAM-PEOPLE", name: "Priya Kapoor", email: "priya.kapoor@heizen.work", initials: "PK", role: "Support Agent", availability: "Available", capacity: 15, status: "Active" },
    { id: "AGT-004", teamId: "TEAM-PEOPLE", name: "Vikram Singh", email: "vikram.singh@heizen.work", initials: "VS", role: "Support Agent", availability: "Limited", capacity: 12, status: "Active" },
    { id: "MEM-NK", teamId: "TEAM-PEOPLE", name: "Neha Kapoor", email: "neha.kapoor@heizen.work", initials: "NK", role: "Team Lead", availability: "Available", capacity: 10, status: "Active" },
    // Other teams — leads seeded as Team Lead members
    { id: "MEM-AM", teamId: "TEAM-PAY", name: "Arjun Malhotra", email: "arjun.malhotra@heizen.work", initials: "AM", role: "Team Lead", availability: "Available", capacity: 15, status: "Active" },
    { id: "MEM-KS", teamId: "TEAM-IT", name: "Karan Shah", email: "karan.shah@heizen.work", initials: "KS", role: "Team Lead", availability: "Available", capacity: 15, status: "Active" },
    { id: "MEM-MJ", teamId: "TEAM-ADMIN", name: "Meera Joshi", email: "meera.joshi@heizen.work", initials: "MJ", role: "Team Lead", availability: "Available", capacity: 15, status: "Active" },
    { id: "MEM-NR", teamId: "TEAM-COMP", name: "Nikhil Rao", email: "nikhil.rao@heizen.work", initials: "NR", role: "Team Lead", availability: "Available", capacity: 15, status: "Active" },
  ],
};

/** Deep clone of the seed (so mutations never touch the constant). */
export function cloneSeedConfig(): OrgConfig {
  return JSON.parse(JSON.stringify(SEED_ORG_CONFIG)) as OrgConfig;
}

export interface SupportStaff {
  name: string;
  email: string;
  initials: string;
}

/**
 * Support-eligible staff (have the required support permissions). Only these
 * people can be added as team members — the Add Member search reads from here.
 */
export const SUPPORT_STAFF: SupportStaff[] = [
  { name: "Ananya Sharma", email: "ananya.sharma@heizen.work", initials: "AS" },
  { name: "Rohan Mehta", email: "rohan.mehta@heizen.work", initials: "RM" },
  { name: "Priya Kapoor", email: "priya.kapoor@heizen.work", initials: "PK" },
  { name: "Vikram Singh", email: "vikram.singh@heizen.work", initials: "VS" },
  { name: "Neha Kapoor", email: "neha.kapoor@heizen.work", initials: "NK" },
  { name: "Arjun Malhotra", email: "arjun.malhotra@heizen.work", initials: "AM" },
  { name: "Karan Shah", email: "karan.shah@heizen.work", initials: "KS" },
  { name: "Meera Joshi", email: "meera.joshi@heizen.work", initials: "MJ" },
  { name: "Nikhil Rao", email: "nikhil.rao@heizen.work", initials: "NR" },
  { name: "Ishaan Gupta", email: "ishaan.gupta@heizen.work", initials: "IG" },
  { name: "Sara Khan", email: "sara.khan@heizen.work", initials: "SK" },
  { name: "Devansh Patel", email: "devansh.patel@heizen.work", initials: "DP" },
];
