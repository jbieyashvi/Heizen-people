"use client";

import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/cn";
import type { AgentTicket } from "@/lib/types";
import type { AgentSortKey } from "@/lib/agent/agentFilters";
import { formatDisplayDate } from "@/lib/support/dateFormat";
import { initialsForName } from "@/lib/agent/team";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { SlaBadge } from "@/components/agent/SlaBadge";
import { RowActions } from "@/components/agent/queue/RowActions";

interface Column {
  label: string;
  sortKey?: AgentSortKey;
  align?: "right";
}

const COLUMNS: Column[] = [
  { label: "Ticket ID" },
  { label: "Employee" },
  { label: "Department" },
  { label: "Subject" },
  { label: "Category" },
  { label: "Priority", sortKey: "priority" },
  { label: "Status", sortKey: "status" },
  { label: "Assigned To" },
  { label: "Created", sortKey: "created" },
  { label: "SLA", sortKey: "sla" },
  { label: "Action", align: "right" },
];

interface TableProps {
  rows: AgentTicket[];
  sort: AgentSortKey | "";
  dir: "asc" | "desc";
  onSort: (key: AgentSortKey) => void;
  onAssign: (ticket: AgentTicket) => void;
  onReassign: (ticket: AgentTicket) => void;
}

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <ChevronsUpDown className="h-3.5 w-3.5 text-slate-300" strokeWidth={1.75} aria-hidden />;
  return dir === "asc" ? (
    <ArrowUp className="h-3.5 w-3.5 text-heizen-600" strokeWidth={2} aria-hidden />
  ) : (
    <ArrowDown className="h-3.5 w-3.5 text-heizen-600" strokeWidth={2} aria-hidden />
  );
}

export function AgentQueueTable({ rows, sort, dir, onSort, onAssign, onReassign }: TableProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1160px] border-collapse text-left text-sm">
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-[#EAECEE] bg-surface-muted">
            {COLUMNS.map((col) => {
              const isSorted = col.sortKey && sort === col.sortKey;
              return (
                <th
                  key={col.label}
                  scope="col"
                  aria-sort={col.sortKey ? (isSorted ? (dir === "asc" ? "ascending" : "descending") : "none") : undefined}
                  className={cn(
                    "whitespace-nowrap bg-surface-muted px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400",
                    col.align === "right" && "text-right",
                  )}
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
          {rows.map((t) => (
            <tr
              key={t.id}
              onClick={() => router.push(`/agent/tickets/${t.id}`)}
              className="cursor-pointer transition-colors hover:bg-slate-50/70"
            >
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
              <td className="max-w-[240px] truncate px-4 py-3 text-slate-700" title={t.subject}>
                {t.subject}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-500">{t.category}</td>
              <td className="whitespace-nowrap px-4 py-3">
                <PriorityBadge priority={t.priority} />
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <StatusBadge status={t.status} label={t.status} />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                {t.assignedAgent ?? <span className="text-slate-400">Unassigned</span>}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDisplayDate(t.createdAt)}</td>
              <td className="whitespace-nowrap px-4 py-3">
                <SlaBadge sla={t.sla} />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                <RowActions ticket={t} onAssign={onAssign} onReassign={onReassign} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
