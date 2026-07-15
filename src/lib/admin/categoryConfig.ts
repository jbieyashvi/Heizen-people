import type { Category, CategoryConfig, RequestType } from "@/lib/admin/categoryTypes";

export const CATEGORY_CONFIG_VERSION = 1;
const TS = "2026-07-01T00:00:00.000Z";

function rt(catId: string, name: string, order: number): RequestType {
  return {
    id: `${catId}-rt-${order}`,
    name,
    helperText: "",
    order,
    status: "Active",
    visibility: "Visible",
    defaultPriority: "None",
    createdAt: TS,
    updatedAt: TS,
  };
}

function types(catId: string, names: string[]): RequestType[] {
  return names.map((n, i) => rt(catId, n, i + 1));
}

/**
 * Seed categories + request types. Routing references the centralized org config
 * (departmentId / teamId). This is the single source the Employee dashboard and
 * Raise New Ticket form read from.
 */
export const SEED_CATEGORY_CONFIG: CategoryConfig = {
  version: CATEGORY_CONFIG_VERSION,
  categories: [
    {
      id: "CAT-HR", name: "HR", description: "Policies, records and general HR help", icon: "users",
      departmentId: "DEP-PEOPLE", teamId: "TEAM-PEOPLE", order: 1, status: "Active", visibility: "Visible",
      requestTypes: types("CAT-HR", ["Policy Question", "Employee Letter", "PF", "Insurance", "Benefits", "Others"]),
      createdAt: TS, updatedAt: TS,
    },
    {
      id: "CAT-PAYROLL", name: "Payroll", description: "Salary, payslips and reimbursements", icon: "wallet",
      departmentId: "DEP-PAYROLL", teamId: "TEAM-PAY", order: 2, status: "Active", visibility: "Visible",
      requestTypes: types("CAT-PAYROLL", ["Salary Query", "Incorrect Salary", "Reimbursement", "Payslip", "Tax", "Others"]),
      createdAt: TS, updatedAt: TS,
    },
    {
      id: "CAT-LEAVE", name: "Leave", description: "Leave balance, approvals and queries", icon: "calendar",
      departmentId: "DEP-PEOPLE", teamId: "TEAM-PEOPLE", order: 3, status: "Active", visibility: "Visible",
      requestTypes: types("CAT-LEAVE", ["Leave Balance", "Leave Correction", "Leave Approval", "Others"]),
      createdAt: TS, updatedAt: TS,
    },
    {
      id: "CAT-IT", name: "IT Support", description: "Accounts, access and software issues", icon: "monitor",
      departmentId: "DEP-IT", teamId: "TEAM-IT", order: 4, status: "Active", visibility: "Visible",
      requestTypes: types("CAT-IT", ["Laptop Issue", "Software Access", "Password Reset", "Email Issue", "VPN", "Hardware", "Others"]),
      createdAt: TS, updatedAt: TS,
    },
    {
      id: "CAT-ADMIN", name: "Administration", description: "Facilities, travel and office requests", icon: "building",
      departmentId: "DEP-ADMIN", teamId: "TEAM-ADMIN", order: 5, status: "Active", visibility: "Visible", prototypeNote: true,
      requestTypes: types("CAT-ADMIN", ["Office Access", "Workplace Facility", "ID Card", "Travel Support", "Other Administrative Request"]),
      createdAt: TS, updatedAt: TS,
    },
    {
      id: "CAT-ASSETS", name: "Assets", description: "Laptops, hardware and equipment", icon: "laptop",
      departmentId: "DEP-ADMIN", teamId: "TEAM-ADMIN", order: 6, status: "Active", visibility: "Visible",
      requestTypes: types("CAT-ASSETS", ["Asset Request", "Asset Return", "Repair", "Replacement"]),
      createdAt: TS, updatedAt: TS,
    },
    {
      id: "CAT-COMPLIANCE", name: "Compliance", description: "Audits, disclosures and policy sign-offs", icon: "shield",
      departmentId: "DEP-COMPLIANCE", teamId: "TEAM-COMP", order: 7, status: "Active", visibility: "Visible",
      requestTypes: types("CAT-COMPLIANCE", ["NDA", "Policy Acceptance", "Background Verification", "Others"]),
      createdAt: TS, updatedAt: TS,
    },
    {
      id: "CAT-EMPDOCS", name: "Employment Documents", description: "Letters, verifications and certificates", icon: "file-badge",
      departmentId: "DEP-PEOPLE", teamId: "TEAM-PEOPLE", order: 8, status: "Active", visibility: "Visible",
      requestTypes: types("CAT-EMPDOCS", ["Offer Letter", "Appointment Letter", "Experience Letter", "Salary Slip", "Employment Verification", "Relieving Letter", "Increment Letter"]),
      createdAt: TS, updatedAt: TS,
    },
    {
      id: "CAT-GENERAL", name: "General Query", description: "General information and process clarifications", icon: "help-circle",
      departmentId: "DEP-PEOPLE", teamId: "TEAM-PEOPLE", order: 9, status: "Active", visibility: "Visible", prototypeNote: true,
      requestTypes: types("CAT-GENERAL", ["General Information", "Process Clarification", "Other Query"]),
      createdAt: TS, updatedAt: TS,
    },
  ],
};

export function cloneSeedCategoryConfig(): CategoryConfig {
  return JSON.parse(JSON.stringify(SEED_CATEGORY_CONFIG)) as CategoryConfig;
}

/** Categories flagged as prototype (Admin-only note). */
export function isPrototypeCategory(category: Pick<Category, "prototypeNote">): boolean {
  return category.prototypeNote === true;
}
