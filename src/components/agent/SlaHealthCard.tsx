import { cn } from "@/lib/cn";
import type { SlaHealth } from "@/lib/agent/agentTickets";

interface Row {
  key: string;
  label: string;
  count: number;
  dot: string;
  bar: string;
  text: string;
}

export function SlaHealthCard({ health }: { health: SlaHealth }) {
  const total = health.total;
  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));

  const rows: Row[] = [
    { key: "within", label: "Within SLA", count: health.within, dot: "bg-emerald-500", bar: "bg-emerald-400", text: "text-emerald-700" },
    { key: "approaching", label: "Approaching SLA", count: health.approaching, dot: "bg-amber-500", bar: "bg-amber-400", text: "text-amber-800" },
    { key: "breached", label: "SLA Breached", count: health.breached, dot: "bg-red-500", bar: "bg-red-500", text: "text-red-700" },
  ];

  if (total === 0) {
    return <p className="text-sm text-slate-400">No active tickets with an SLA right now.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Stacked proportion bar */}
      <div className="flex h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden>
        {rows.map((r) =>
          r.count > 0 ? <span key={r.key} className={r.bar} style={{ width: `${pct(r.count)}%` }} /> : null,
        )}
      </div>
      <ul className="flex flex-col gap-2">
        {rows.map((r) => (
          <li key={r.key} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", r.dot)} aria-hidden />
              <span className={cn("text-sm font-medium", r.text)}>{r.label}</span>
            </span>
            <span className="text-sm text-slate-500">
              <span className="font-semibold tabular-nums text-slate-800">{r.count}</span>{" "}
              <span className="text-slate-400">({pct(r.count)}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
