"use client";

import Link from "next/link";
import { useTickets } from "@/lib/support/useTickets";
import { formatDisplayDate } from "@/lib/support/dateFormat";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";

const COLUMNS = [
  "Ticket ID",
  "Subject",
  "Category",
  "Priority",
  "Assigned Team",
  "Status",
  "Updated On",
  "Action",
];

const RECENT_LIMIT = 6;

export function RecentTickets() {
  // Same combined data source as My Tickets, so dashboard rows always open a
  // valid ticket and reflect status changes made elsewhere.
  const { tickets, state } = useTickets();
  const rows = tickets.slice(0, RECENT_LIMIT);

  return (
    <div className="overflow-hidden rounded-lg border border-[#EAECEE] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#EAECEE] bg-surface-muted">
              {COLUMNS.map((col) => (
                <th
                  key={col}
                  scope="col"
                  className="whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAECEE]">
            {state === "loading"
              ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {COLUMNS.map((col) => (
                      <td key={col} className="px-4 py-3.5">
                        <div className="h-3.5 rounded bg-slate-100" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((ticket) => (
                  <tr key={ticket.id} className="transition-colors hover:bg-slate-50/60">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-700">{ticket.id}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-slate-700" title={ticket.subject}>
                      {ticket.subject}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">{ticket.category}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">{ticket.assignedTeam}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {formatDisplayDate(ticket.updatedAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link
                        href={`/support/tickets/${ticket.id}`}
                        className="inline-flex items-center rounded-md border border-[#EAECEE] px-2.5 py-1 text-xs font-medium text-heizen-700 outline-none transition-colors hover:border-heizen-200 hover:bg-heizen-50 focus-visible:ring-2 focus-visible:ring-heizen-400"
                        aria-label={`View ticket ${ticket.id}`}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
