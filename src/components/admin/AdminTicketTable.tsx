"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AgentTicket } from "@/lib/types";
import { initialsForName } from "@/lib/agent/team";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { SlaBadge } from "@/components/agent/SlaBadge";

const COLUMNS = [
  "Ticket ID",
  "Employee",
  "Department",
  "Assigned Team",
  "Category",
  "Priority",
  "Status",
  "Assigned Agent",
  "SLA",
  "Action",
];

/** Organization-wide ticket table (Admin). View → /admin/tickets/[id]. */
export function AdminTicketTable({ rows }: { rows: AgentTicket[] }) {
  const router = useRouter();
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[#EAECEE] bg-surface-muted">
            {COLUMNS.map((c) => (
              <th key={c} scope="col" className="whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EAECEE]">
          {rows.map((t) => {
            const href = `/admin/tickets/${t.id}`;
            return (
              <tr key={t.id} onClick={() => router.push(href)} className="cursor-pointer transition-colors hover:bg-slate-50/70">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-700">{t.id}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-600">
                      {initialsForName(t.employeeName)}
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm font-medium text-slate-800">{t.employeeName}</span>
                      <span className="text-xs text-slate-400">{t.employeeId}</span>
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">{t.employeeDepartment}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">{t.assignedTeam}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">{t.category}</td>
                <td className="whitespace-nowrap px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                <td className="whitespace-nowrap px-4 py-3"><StatusBadge status={t.status} label={t.status} /></td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                  {t.assignedAgent ?? <span className="text-slate-400">Unassigned</span>}
                </td>
                <td className="whitespace-nowrap px-4 py-3"><SlaBadge sla={t.sla} /></td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Link
                    href={href}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center rounded-md border border-[#EAECEE] px-2.5 py-1 text-xs font-medium text-heizen-700 outline-none transition-colors hover:border-heizen-200 hover:bg-heizen-50 focus-visible:ring-2 focus-visible:ring-heizen-400"
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
