import type { LucideIcon } from "lucide-react";

/** Status used across the Support Center ticket lifecycle. */
export type TicketStatus =
  | "Open"
  | "Assigned"
  | "In Progress"
  | "Waiting for Employee"
  | "Resolved"
  | "Closed";

/**
 * Ticket priority. Employees can select Low/Medium/High; "Critical" is
 * support-only (set by agents/automation) and never offered in the employee form.
 */
export type TicketPriority = "Low" | "Medium" | "High" | "Critical";

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
  /** Optional nested items shown indented under this entry (e.g. My Tickets). */
  children?: NavItem[];
}

export interface Notification {
  id: string;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
}

export interface Employee {
  id: string;
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
  /** Selected category id (from the centralized category config). */
  category: string | null;
  requestType: string | null;
  /** Selected request type id (snapshotted onto the ticket). */
  requestTypeId: string | null;
  subject: string;
  /** Rich-text HTML from the description editor. */
  descriptionHtml: string;
  /** Plain-text projection of the description, used for validation/counter. */
  descriptionText: string;
  priority: TicketPriority;
}

/**
 * Normalised ticket used by the "My Tickets" experience. Both seeded mock
 * tickets and locally-stored (form-submitted) tickets are mapped to this shape
 * so filtering, sorting and rendering never care about the source.
 */
export interface TicketRecord {
  id: string;
  subject: string;
  /** Display category label, e.g. "IT Support". */
  category: string;
  priority: TicketPriority;
  /** Display team label, e.g. "IT Team". */
  assignedTeam: string;
  status: TicketStatus;
  /** ISO timestamps. */
  createdAt: string;
  updatedAt: string;
  /** ISO timestamp of the most recent activity (mirrors updatedAt for records). */
  lastActivityAt: string;
  resolvedAt?: string;
  closedAt?: string;
  /* Agent-facing fields (shared record — same data both experiences read). */
  /** Employee who raised the ticket. */
  employeeName: string;
  /** Stable employee identifier shown in the agent view. */
  employeeId: string;
  /** That employee's department. */
  employeeDepartment: string;
  /** Support agent handling it, or null when unassigned. */
  assignedAgent: string | null;
  /** Support agent identifier, or null when unassigned. */
  assignedAgentId: string | null;
}

export type TicketSortKey = "createdAt" | "updatedAt" | "priority" | "status";
export type SortDirection = "asc" | "desc";

/* -------------------------------------------------------------------------- */
/*  Support Agent — roles, SLA, agent ticket view                               */
/* -------------------------------------------------------------------------- */

/** Prototype demo roles selectable via the "View as" switcher. */
export type DemoRole = "employee" | "agent" | "admin";

/** SLA lifecycle state for an active ticket. */
export type SlaState = "within" | "approaching" | "breached" | "paused" | "met";

/** Computed SLA information for a ticket. */
export interface SlaInfo {
  state: SlaState;
  /** ISO due timestamp (null when not applicable, e.g. closed). */
  dueAt: string | null;
  /** Milliseconds remaining (negative when breached). */
  remainingMs: number;
  /** Human label, e.g. "18h remaining" / "Breached by 3h" / "Waiting for employee". */
  label: string;
}

/**
 * Ticket enriched with SLA + activity metadata for the agent workspace. Built
 * from the shared TicketRecord — never a separate dataset.
 */
export interface AgentTicket extends TicketRecord {
  sla: SlaInfo;
  /** Milliseconds from creation to first agent response, or null if none yet. */
  firstResponseMs: number | null;
  escalated: boolean;
  /** ISO timestamp of the most recent activity (mirrors updatedAt). */
  lastActivityAt: string;
}

/* -------------------------------------------------------------------------- */
/*  Ticket Details — conversation, activity, attachments                        */
/* -------------------------------------------------------------------------- */

/** Whether content is public (employee-visible) or support-only. */
export type Visibility = "public" | "internal";

/** A mock file attached to a conversation message. */
export interface MessageAttachment {
  id: string;
  name: string;
  /** Size in bytes (for display only — files are mock). */
  size: number;
  /** Inherited from the parent message; internal attachments never reach employees. */
  visibility?: Visibility;
}

/** Who authored a conversation message shown to the employee. */
export type ConversationAuthor = "employee" | "agent";

/**
 * A conversation message. Public messages appear in both the employee and agent
 * views; internal notes (visibility: "internal") are support-only and must never
 * reach the employee experience. Undefined visibility is treated as public
 * (migration-safe for older persisted data).
 */
export interface ConversationMessage {
  id: string;
  author: ConversationAuthor;
  authorName: string;
  /** Role/team shown under the name, e.g. "Payroll Support". */
  authorMeta: string;
  /** ISO timestamp. */
  createdAt: string;
  bodyHtml: string;
  attachments: MessageAttachment[];
  visibility?: Visibility;
}

/** A chronological system event shown in the activity timeline. */
export interface ActivityEvent {
  id: string;
  label: string;
  /** Person or system responsible. */
  actor: string;
  /** ISO timestamp. */
  createdAt: string;
  /** Optional before → after values for change events. */
  fromValue?: string;
  toValue?: string;
  /** Support-only events (internal notes, escalation, reassignment) hidden from employees. */
  internal?: boolean;
}

/** Escalation details stored on a ticket. */
export interface EscalationInfo {
  target: string;
  reason: string;
  note?: string;
  at: string;
}

/** The full, mutable ticket used by the Ticket Details experience. */
export interface TicketDetail {
  id: string;
  subject: string;
  category: string;
  requestType: string;
  priority: TicketPriority;
  assignedTeam: string;
  /** Support agent handling it, or null when unassigned. */
  assignedAgent: string | null;
  assignedAgentId: string | null;
  status: TicketStatus;
  /** ISO timestamps. */
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  reopenedAt?: string;
  /** Set when the ticket has been escalated (does not change priority). */
  escalated?: boolean;
  escalation?: EscalationInfo;
  /** Duplicate ticket: id of the primary it was merged into (this ticket is closed). */
  mergedIntoTicketId?: string;
  /** Primary ticket: ids of duplicates merged into it. */
  mergedTicketIds?: string[];
  messages: ConversationMessage[];
  activity: ActivityEvent[];
}

/**
 * A seeded ticket as authored in mock data. Derived fields (employeeId,
 * assignedAgentId, resolvedAt/closedAt, lastActivityAt) are computed when the
 * seed is mapped to a TicketRecord, so they aren't repeated per entry.
 */
export interface SeedTicket {
  id: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  assignedTeam: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  employeeName: string;
  employeeDepartment: string;
  assignedAgent: string | null;
  requestType: string;
  description: string;
  attachments?: MessageAttachment[];
}

/** Full filter/sort/pagination state for the My Tickets table. */
export interface TicketFilterState {
  q: string;
  /** Status slug or "all". */
  status: string;
  /** Category label or "all". */
  category: string;
  /** "all" | "Low" | "Medium" | "High". */
  priority: string;
  /** Created-on range, yyyy-mm-dd or "". */
  from: string;
  to: string;
  sort: TicketSortKey;
  dir: SortDirection;
  page: number;
}

/** A ticket persisted to local storage after submission. */
export interface StoredTicket {
  id: string;
  subject: string;
  /** Category id from config (new tickets); label is the immutable snapshot. */
  categoryId: string;
  categoryLabel: string;
  /** Request type id from config; requestType is the immutable label snapshot. */
  requestTypeId: string;
  requestType: string;
  descriptionHtml: string;
  priority: TicketPriority;
  /** Resolved routing team (ticketTeam value). */
  assignedTeam: string;
  status: TicketStatus;
  attachmentCount: number;
  /** ISO timestamps. */
  createdAt: string;
  updatedAt: string;
}
