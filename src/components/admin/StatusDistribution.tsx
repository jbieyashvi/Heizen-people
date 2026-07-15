import { cn } from "@/lib/cn";
import type { TicketStatus } from "@/lib/types";
import type { StatusSlice } from "@/lib/admin/analytics";
import { InlineEmpty } from "@/components/agent/AgentStates";

const BAR: Record<TicketStatus, string> = {
  Open: "bg-slate-400",
  Assigned: "bg-indigo-400",
  "In Progress": "bg-heizen-500",
  "Waiting for Employee": "bg-amber-400",
  Resolved: "bg-emerald-400",
  Closed: "bg-slate-300",
};

export function StatusDistribution({ slices }: { slices: StatusSlice[] }) {
  const total = slices.reduce((a, s) => a + s.count, 0);
  if (total === 0) return <InlineEmpty title="No tickets in this range" note="Adjust the filters to see status distribution." />;

  return (
    <ul className="flex flex-col gap-2.5">
      {slices.map((s) => (
        <li key={s.status} className="flex items-center gap-3">
          <span className="w-36 shrink-0 text-sm text-slate-600">{s.status}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div className={cn("h-full rounded-full", BAR[s.status])} style={{ width: `${s.pct}%` }} aria-hidden />
          </div>
          <span className="w-24 shrink-0 text-right text-xs text-slate-500">
            <span className="font-semibold tabular-nums text-slate-800">{s.count}</span>{" "}
            <span className="text-slate-400">({s.pct}%)</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
