import type { LucideIcon } from "lucide-react";

/** Status used across the Support Center ticket lifecycle. */
export type TicketStatus =
  | "Open"
  | "Assigned"
  | "In Progress"
  | "Waiting for Employee"
  | "Resolved"
  | "Closed";

export type TicketPriority = "Low" | "Medium" | "High";

export type SupportTeam =
  | "HR"
  | "Payroll"
  | "Leave"
  | "IT Support"
  | "Administration"
  | "Assets"
  | "Compliance"
  | "Employment Documents";

export interface Ticket {
  id: string;
  subject: string;
  category: SupportTeam;
  priority: TicketPriority;
  assignedTeam: SupportTeam;
  status: TicketStatus;
  updatedOn: string;
}

/** A single tile in the ticket status summary row. */
export interface StatusSummaryItem {
  key: string;
  label: string;
  count: number;
  /** Marks the tile that needs employee attention (softly emphasised). */
  highlight?: boolean;
}

export interface RequestCategory {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

export interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  comingSoon?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
}

export interface Employee {
  name: string;
  firstName: string;
  department: string;
  role: string;
  email: string;
  initials: string;
}

export interface ActionItem {
  ticketId: string;
  subject: string;
  team: SupportTeam;
  message: string;
}

/* -------------------------------------------------------------------------- */
/*  Raise New Ticket flow                                                       */
/* -------------------------------------------------------------------------- */

/** Category keys used by the Raise New Ticket form. */
export type TicketCategoryKey =
  | "hr"
  | "payroll"
  | "leave"
  | "it-support"
  | "administration"
  | "assets"
  | "compliance"
  | "employment-documents"
  | "general-query";

/** Teams a ticket can be routed to (derived from the category). */
export type AssignedTeam =
  | "People Operations"
  | "Payroll Team"
  | "IT Team"
  | "Administration"
  | "Compliance Team";

/** A category option in the Raise New Ticket form. */
export interface TicketCategoryOption {
  key: TicketCategoryKey;
  label: string;
  icon: LucideIcon;
}

/** A file attached to a draft ticket, with client-side validation state. */
export interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  status: "success" | "error";
  error?: string;
}

/** Working values held by the Raise New Ticket form. */
export interface TicketDraft {
  category: TicketCategoryKey | null;
  requestType: string | null;
  subject: string;
  /** Rich-text HTML from the description editor. */
  descriptionHtml: string;
  /** Plain-text projection of the description, used for validation/counter. */
  descriptionText: string;
  priority: TicketPriority;
}

/** A ticket persisted to local storage after submission. */
export interface StoredTicket {
  id: string;
  subject: string;
  categoryKey: TicketCategoryKey;
  categoryLabel: string;
  requestType: string;
  descriptionHtml: string;
  priority: TicketPriority;
  assignedTeam: AssignedTeam;
  status: TicketStatus;
  attachmentCount: number;
  /** ISO timestamps. */
  createdAt: string;
  updatedAt: string;
}
