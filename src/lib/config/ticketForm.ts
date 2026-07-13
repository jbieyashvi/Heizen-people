import {
  Users,
  Wallet,
  CalendarDays,
  Monitor,
  Building2,
  Laptop,
  ShieldCheck,
  FileBadge,
  HelpCircle,
} from "lucide-react";
import type {
  AssignedTeam,
  TicketCategoryKey,
  TicketCategoryOption,
  TicketPriority,
} from "@/lib/types";

/**
 * Central configuration for the Raise New Ticket flow.
 *
 * NOTE: request-type lists and team routing are intentionally kept here (and not
 * hard-coded into components) so product/PRD changes are a single-file edit.
 * Options marked PROTOTYPE ASSUMPTION are placeholders until the PRD defines them.
 */

/** Selectable request categories, in display order. */
export const TICKET_CATEGORIES: TicketCategoryOption[] = [
  { key: "hr", label: "HR", icon: Users },
  { key: "payroll", label: "Payroll", icon: Wallet },
  { key: "leave", label: "Leave", icon: CalendarDays },
  { key: "it-support", label: "IT Support", icon: Monitor },
  { key: "administration", label: "Administration", icon: Building2 },
  { key: "assets", label: "Assets", icon: Laptop },
  { key: "compliance", label: "Compliance", icon: ShieldCheck },
  { key: "employment-documents", label: "Employment Documents", icon: FileBadge },
  { key: "general-query", label: "General Query", icon: HelpCircle },
];

/** Request types available per category. */
export const REQUEST_TYPES: Record<TicketCategoryKey, string[]> = {
  hr: ["Policy Question", "Employee Letter", "PF", "Insurance", "Benefits", "Others"],
  payroll: ["Salary Query", "Incorrect Salary", "Reimbursement", "Payslip", "Tax", "Others"],
  leave: ["Leave Balance", "Leave Correction", "Leave Approval", "Others"],
  "it-support": [
    "Laptop Issue",
    "Software Access",
    "Password Reset",
    "Email Issue",
    "VPN",
    "Hardware",
    "Others",
  ],
  assets: ["Asset Request", "Asset Return", "Repair", "Replacement"],
  "employment-documents": [
    "Offer Letter",
    "Appointment Letter",
    "Experience Letter",
    "Salary Slip",
    "Employment Verification",
    "Relieving Letter",
    "Increment Letter",
  ],
  compliance: ["NDA", "Policy Acceptance", "Background Verification", "Others"],
  // PROTOTYPE ASSUMPTION — PRD does not yet define Administration request types.
  administration: [
    "Office Access",
    "Workplace Facility",
    "ID Card",
    "Travel Support",
    "Other Administrative Request",
  ],
  // PROTOTYPE ASSUMPTION — PRD does not yet define General Query request types.
  "general-query": ["General Information", "Process Clarification", "Other Query"],
};

/** Category → routed team. */
export const CATEGORY_TEAM_MAP: Record<TicketCategoryKey, AssignedTeam> = {
  hr: "People Operations",
  leave: "People Operations",
  "employment-documents": "People Operations",
  payroll: "Payroll Team",
  "it-support": "IT Team",
  assets: "Administration",
  administration: "Administration",
  compliance: "Compliance Team",
  "general-query": "People Operations",
};

export interface PriorityOption {
  value: TicketPriority;
  label: string;
  description: string;
}

/** Employee-selectable priorities (Critical is support-team only). */
export const PRIORITY_OPTIONS: PriorityOption[] = [
  { value: "Low", label: "Low", description: "General request with no immediate impact" },
  { value: "Medium", label: "Medium", description: "Important request requiring timely support" },
  { value: "High", label: "High", description: "Work is significantly affected" },
];

export const DEFAULT_PRIORITY: TicketPriority = "Medium";

/** Attachment constraints. */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_FILE_SIZE_LABEL = "10 MB";

export const ALLOWED_FILE_EXTENSIONS = ["pdf", "docx", "jpg", "jpeg", "png", "xlsx"] as const;

/** Human-readable accepted-types label shown in the upload area. */
export const ALLOWED_FILE_TYPES_LABEL = "PDF, DOCX, JPG, PNG, XLSX";

/** `accept` attribute for the hidden file input. */
export const FILE_ACCEPT_ATTR =
  ".pdf,.docx,.jpg,.jpeg,.png,.xlsx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/** Validation limits. */
export const SUBJECT_MAX_LENGTH = 100;
export const DESCRIPTION_MIN_LENGTH = 20;

export function getRequestTypes(category: TicketCategoryKey | null): string[] {
  return category ? REQUEST_TYPES[category] : [];
}

export function getAssignedTeam(category: TicketCategoryKey | null): AssignedTeam | null {
  return category ? CATEGORY_TEAM_MAP[category] : null;
}

export function getCategoryLabel(category: TicketCategoryKey | null): string | null {
  return TICKET_CATEGORIES.find((c) => c.key === category)?.label ?? null;
}
