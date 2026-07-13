import type { ActionItem, StatusSummaryItem } from "@/lib/types";

/** Compact ticket status summary shown on the Support Center dashboard. */
export const statusSummary: StatusSummaryItem[] = [
  { key: "open", label: "Open", count: 4 },
  { key: "in-progress", label: "In Progress", count: 3 },
  { key: "waiting", label: "Waiting for You", count: 2, highlight: true },
  { key: "resolved", label: "Resolved", count: 12 },
  { key: "closed", label: "Closed", count: 28 },
];

/** Ticket currently awaiting the employee's response. */
export const actionRequired: ActionItem = {
  ticketId: "HSC-2026-000318",
  subject: "Reimbursement receipt required",
  team: "Payroll",
  message: "Payroll needs additional information from you.",
};
