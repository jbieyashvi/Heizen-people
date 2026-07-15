import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import type { CategoryStat } from "@/lib/admin/analytics";
import { InlineEmpty } from "@/components/agent/AgentStates";

export function CategoryRanking({ stats }: { stats: CategoryStat[] }) {
  if (stats.length === 0) return <InlineEmpty title="No category data" note="No tickets match the current filters." />;
  const max = Math.max(1, ...stats.map((s) => s.count));

  return (
    <ul className="flex flex-col gap-2.5">
      {stats.map((s) => {
        const Icon = s.trend.direction === "up" ? ArrowUpRight : s.trend.direction === "down" ? ArrowDownRight : Minus;
        return (
          <li key={s.category} className="flex items-center gap-3">
            <span className="w-40 shrink-0 truncate text-sm text-slate-600" title={s.category}>{s.category}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-heizen-400" style={{ width: `${(s.count / max) * 100}%` }} aria-hidden />
            </div>
            <span className="flex w-28 shrink-0 items-center justify-end gap-2 text-xs text-slate-500">
              <span><span className="font-semibold tabular-nums text-slate-800">{s.count}</span> ({s.pct}%)</span>
              <span className="inline-flex items-center text-slate-400" title={`${s.trend.pct}% vs previous period`}>
                <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
