"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import type { DepartmentStat } from "@/lib/admin/analytics";
import { InlineEmpty } from "@/components/agent/AgentStates";

interface DepartmentTableProps {
  stats: DepartmentStat[];
  activeTeam: string;
  onSelectTeam: (team: string) => void;
}

export function DepartmentTable({ stats, activeTeam, onSelectTeam }: DepartmentTableProps) {
  const max = Math.max(1, ...stats.map((s) => s.total));
  const anyData = stats.some((s) => s.total > 0);
  if (!anyData) return <InlineEmpty title="No department data" note="No tickets match the current filters." />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[#EAECEE] text-xs font-semibold uppercase tracking-wide text-slate-400">
            <th scope="col" className="px-3 py-2">Department</th>
            <th scope="col" className="px-3 py-2">Total</th>
            <th scope="col" className="px-3 py-2">Open</th>
            <th scope="col" className="px-3 py-2">Overdue</th>
            <th scope="col" className="px-3 py-2">SLA</th>
            <th scope="col" className="px-3 py-2 text-right">Tickets</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EAECEE]">
          {stats.map((s) => {
            const active = activeTeam === s.team;
            return (
              <tr key={s.team} className={cn(active && "bg-heizen-50/60")}>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => onSelectTeam(s.team)}
                    aria-pressed={active}
                    className={cn("rounded text-left font-medium outline-none hover:text-heizen-700 focus-visible:ring-2 focus-visible:ring-heizen-400", active ? "text-heizen-700" : "text-slate-700")}
                  >
                    {s.team}
                  </button>
                  <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-heizen-400" style={{ width: `${(s.total / max) * 100}%` }} aria-hidden />
                  </div>
                </td>
                <td className="px-3 py-2 font-semibold tabular-nums text-slate-800">{s.total}</td>
                <td className="px-3 py-2 tabular-nums text-slate-600">{s.open}</td>
                <td className={cn("px-3 py-2 tabular-nums", s.overdue > 0 ? "font-medium text-red-600" : "text-slate-600")}>{s.overdue}</td>
                <td className="px-3 py-2 tabular-nums text-slate-600">{s.slaCompliance}%</td>
                <td className="px-3 py-2 text-right">
                  <Link
                    href={`/admin/tickets?team=${encodeURIComponent(s.team)}`}
                    className="inline-flex items-center rounded-md border border-[#EAECEE] px-2 py-0.5 text-xs font-medium text-heizen-700 outline-none hover:border-heizen-200 hover:bg-heizen-50 focus-visible:ring-2 focus-visible:ring-heizen-400"
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
