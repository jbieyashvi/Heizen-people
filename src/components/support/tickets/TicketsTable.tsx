"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import type { SortDirection, TicketRecord, TicketSortKey } from "@/lib/types";
import { formatDisplayDate } from "@/lib/support/dateFormat";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";

interface TicketsTableProps {
  rows: TicketRecord[];
  sort: TicketSortKey;
  dir: SortDirection;
  onSort: (key: TicketSortKey) => void;
}

interface ColumnDef {
  label: string;
  sortKey?: TicketSortKey;
  className?: string;
}

const COLUMNS: ColumnDef[] = [
  { label: "Ticket ID" },
  { label: "Subject" },
  { label: "Category" },
  { label: "Priority", sortKey: "priority" },
  { label: "Assigned Team" },
  { label: "Status", sortKey: "status" },
  { label: "Created On", sortKey: "createdAt" },
  { label: "Updated On", sortKey: "updatedAt" },
  { label: "Action" },
];

function SortIcon({ active, dir }: { active: boolean; dir: SortDirection }) {
  if (!active) {
    return <ChevronsUpDown className="h-3.5 w-3.5 text-slate-300" strokeWidth={1.75} aria-hidden />;
  }
  return dir === "asc" ? (
    <ArrowUp className="h-3.5 w-3.5 text-heizen-600" strokeWidth={2} aria-hidden />
  ) : (
    <ArrowDown className="h-3.5 w-3.5 text-heizen-600" strokeWidth={2} aria-hidden />
  );
}

export function TicketsTable({ rows, sort, dir, onSort }: TicketsTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[#EAECEE] bg-surface-muted">
            {COLUMNS.map((col) => {
              const isSorted = col.sortKey && sort === col.sortKey;
              return (
                <th
                  key={col.label}
                  scope="col"
                  aria-sort={
                    col.sortKey
                      ? isSorted
                        ? dir === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                      : undefined
                  }
                  className="whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400"
                >
                  {col.sortKey ? (
                    <button
                      type="button"
                      onClick={() => onSort(col.sortKey!)}
                      className="inline-flex items-center gap-1 rounded outline-none hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-heizen-400"
                    >
                      {col.label}
                      <SortIcon active={!!isSorted} dir={dir} />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EAECEE]">
          {rows.map((ticket) => {
            const href = `/support/tickets/${ticket.id}`;
            return (
              <tr
                key={ticket.id}
                onClick={() => router.push(href)}
                className="cursor-pointer transition-colors hover:bg-slate-50/70"
              >
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-700">
                  {ticket.id}
                </td>
                <td
                  className="max-w-[240px] truncate px-4 py-3 text-slate-700"
                  title={ticket.subject}
                >
                  {ticket.subject}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">{ticket.category}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <PriorityBadge priority={ticket.priority} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                  {ticket.assignedTeam}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                  {formatDisplayDate(ticket.createdAt)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                  {formatDisplayDate(ticket.updatedAt)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Link
                    href={href}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center rounded-md border border-[#EAECEE] px-2.5 py-1 text-xs font-medium text-heizen-700 outline-none transition-colors hover:border-heizen-200 hover:bg-heizen-50 focus-visible:ring-2 focus-visible:ring-heizen-400"
                    aria-label={`View ticket ${ticket.id}`}
                  >
                    View
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
