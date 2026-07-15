import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import type { Delta, TopMetrics } from "@/lib/admin/analytics";

function fmtDuration(ms: number | null): string {
  if (ms === null) return "—";
  const h = ms / (60 * 60 * 1000);
  if (h >= 48) return `${Math.round(h / 24)}d`;
  if (h >= 1) return `${Math.round(h)}h`;
  return `${Math.max(1, Math.round(ms / (60 * 1000)))}m`;
}

function deltaText(d: Delta): string {
  if (d.direction === "flat") return "No change vs previous period";
  return `${d.pct}% ${d.direction === "up" ? "higher" : "lower"} than previous period`;
}

function DeltaTag({ d }: { d: Delta }) {
  const Icon = d.direction === "up" ? ArrowUpRight : d.direction === "down" ? ArrowDownRight : Minus;
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-slate-500" title={deltaText(d)}>
      <Icon className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} aria-hidden />
      {d.direction === "flat" ? "0%" : `${d.pct}%`}
      <span className="sr-only">{deltaText(d)}</span>
    </span>
  );
}

function Kpi({ label, value, d }: { label: string; value: string; d: Delta }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-[#EAECEE] bg-white px-3.5 py-3">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="text-2xl font-semibold tabular-nums text-slate-900">{value}</span>
      <DeltaTag d={d} />
    </div>
  );
}

export function KpiRow({ metrics }: { metrics: TopMetrics }) {
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      <li><Kpi label="Total Tickets" value={String(metrics.total)} d={metrics.deltas.total} /></li>
      <li><Kpi label="Open Tickets" value={String(metrics.open)} d={metrics.deltas.open} /></li>
      <li><Kpi label="Resolved Tickets" value={String(metrics.resolved)} d={metrics.deltas.resolved} /></li>
      <li><Kpi label="Avg Resolution Time" value={fmtDuration(metrics.avgResolutionMs)} d={metrics.deltas.avgResolution} /></li>
      <li><Kpi label="SLA Compliance" value={`${metrics.slaCompliancePct}%`} d={metrics.deltas.sla} /></li>
    </ul>
  );
}
