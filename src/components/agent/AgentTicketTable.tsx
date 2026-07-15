"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import type { AgentTicket } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { SlaBadge } from "@/components/agent/SlaBadge";

const COLUMNS = [
  "Ticket ID",
  "Employee",
  "Department",
  "Subject",
  "Category",
  "Priority",
  "Status",
  "Assigned To",
  "SLA",
  "Action",
];

/** Compact, reusable agent ticket table (worklist + queue views). */
export function AgentTicketTable({ tickets }: { tickets: AgentTicket[] }) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
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
          {tickets.map((t) => {
            const href = `/agent/tickets/${t.id}`;
            return (
              <tr
                key={t.id}
                onClick={() => router.push(href)}
                className="cursor-pointer transition-colors hover:bg-slate-50/70"
              >
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-700">{t.id}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">{t.employeeName}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">{t.employeeDepartment}</td>
                <td className="max-w-[220px] truncate px-4 py-3 text-slate-700" title={t.subject}>
                  {t.subject}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">{t.category}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <PriorityBadge priority={t.priority} />
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <StatusBadge status={t.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                  {t.assignedAgent ?? <span className="text-slate-400">Unassigned</span>}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <SlaBadge sla={t.sla} />
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Link
                    href={href}
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      "inline-flex items-center rounded-md border border-[#EAECEE] px-2.5 py-1 text-xs font-medium text-heizen-700",
                      "outline-none transition-colors hover:border-heizen-200 hover:bg-heizen-50 focus-visible:ring-2 focus-visible:ring-heizen-400",
                    )}
                    aria-label={`View ticket ${t.id}`}
                  >
                    View Ticket
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
