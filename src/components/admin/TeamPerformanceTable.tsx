import Link from "next/link";
import type { TeamPerformance } from "@/lib/admin/analytics";

function fmtDuration(ms: number | null): string {
  if (ms === null) return "—";
  const h = ms / (60 * 60 * 1000);
  if (h >= 48) return `${Math.round(h / 24)}d`;
  if (h >= 1) return `${Math.round(h)}h`;
  return `${Math.max(1, Math.round(ms / (60 * 1000)))}m`;
}

export function TeamPerformanceTable({ rows }: { rows: TeamPerformance[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[#EAECEE] text-xs font-semibold uppercase tracking-wide text-slate-400">
            <th scope="col" className="px-3 py-2">Support Team</th>
            <th scope="col" className="px-3 py-2">Active</th>
            <th scope="col" className="px-3 py-2">Resolved</th>
            <th scope="col" className="px-3 py-2">Avg Resolution</th>
            <th scope="col" className="px-3 py-2">SLA</th>
            <th scope="col" className="px-3 py-2">Overdue</th>
            <th scope="col" className="px-3 py-2 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EAECEE]">
          {rows.map((r) => (
            <tr key={r.team} className="transition-colors hover:bg-slate-50/60">
              <td className="whitespace-nowrap px-3 py-2.5 font-medium text-slate-700">{r.team}</td>
              <td className="px-3 py-2.5 tabular-nums text-slate-600">{r.active}</td>
              <td className="px-3 py-2.5 tabular-nums text-slate-600">{r.resolved}</td>
              <td className="px-3 py-2.5 tabular-nums text-slate-600">{fmtDuration(r.avgResolutionMs)}</td>
              <td className="px-3 py-2.5 tabular-nums text-slate-600">{r.slaCompliance}%</td>
              <td className={r.overdue > 0 ? "px-3 py-2.5 font-medium tabular-nums text-red-600" : "px-3 py-2.5 tabular-nums text-slate-600"}>{r.overdue}</td>
              <td className="px-3 py-2.5 text-right">
                <Link
                  href={`/admin/tickets?team=${encodeURIComponent(r.team)}`}
                  className="inline-flex items-center rounded-md border border-[#EAECEE] px-2.5 py-1 text-xs font-medium text-heizen-700 outline-none transition-colors hover:border-heizen-200 hover:bg-heizen-50 focus-visible:ring-2 focus-visible:ring-heizen-400"
                >
                  View Tickets
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
