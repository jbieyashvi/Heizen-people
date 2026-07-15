import type { ActionItem, StatusSummaryItem } from "@/lib/types";

/** Compact ticket status summary shown on the Support Center dashboard. */
export const statusSummary: StatusSummaryItem[] = [
  { key: "open", label: "Open", count: 4 },
  { key: "in-progress", label: "In Progress", count: 3 },
  { key: "waiting", label: "Waiting for You", count: 2, highlight: true },
  { key: "resolved", label: "Resolved", count: 12 },
  { key: "closed", label: "Closed", count: 28 },
];

/** Ticket currently awaiting the employee's response (a real seeded ticket). */
export const actionRequired: ActionItem = {
  ticketId: "HSC-2026-000335",
  subject: "Reimbursement for client travel expenses",
  team: "Payroll",
  message: "Payroll needs additional information from you.",
};
