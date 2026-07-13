import type { Notification } from "@/lib/types";

/** Notifications shown in the top-header bell panel (mock). */
export const notifications: Notification[] = [
  {
    id: "n-1",
    title: "Payroll needs your input",
    detail: "Ticket HSC-2026-000318 is waiting for a receipt.",
    time: "2h ago",
    unread: true,
  },
  {
    id: "n-2",
    title: "IT Support updated your ticket",
    detail: "New laptop request moved to In Progress.",
    time: "5h ago",
    unread: true,
  },
  {
    id: "n-3",
    title: "HR resolved your request",
    detail: "Emergency contact details were updated.",
    time: "Yesterday",
    unread: false,
  },
];

export const unreadCount = notifications.filter((n) => n.unread).length;
