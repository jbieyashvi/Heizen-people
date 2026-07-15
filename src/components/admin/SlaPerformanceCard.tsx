import { ArrowUpRight, ArrowDownRight, Minus, Info } from "lucide-react";
import { cn } from "@/lib/cn";
import type { SlaPerformance } from "@/lib/admin/analytics";
import { SLA_CONFIG, SLA_TARGETS } from "@/lib/agent/sla";

function Row({ label, count, pct, dot, text }: { label: string; count: number; pct: number; dot: string; text: string }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2">
        <span className={cn("h-2 w-2 rounded-full", dot)} aria-hidden />
        <span className={cn("text-sm", text)}>{label}</span>
      </span>
      <span className="text-sm text-slate-500">
        <span className="font-semibold tabular-nums text-slate-800">{count}</span>{" "}
        <span className="text-slate-400">({pct}%)</span>
      </span>
    </li>
  );
}

export function SlaPerformanceCard({ perf }: { perf: SlaPerformance }) {
  const total = perf.total || 1;
  const pct = (n: number) => Math.round((n / total) * 100);
  const d = perf.overallDelta;
  const DeltaIcon = d.direction === "up" ? ArrowUpRight : d.direction === "down" ? ArrowDownRight : Minus;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">Overall compliance</p>
          <p className="text-2xl font-semibold tabular-nums text-slate-900">{perf.overallPct}%</p>
        </div>
        <span className="inline-flex items-center gap-0.5 text-xs font-medium text-slate-500" title={`${d.pct}% vs previous period`}>
          <DeltaIcon className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} aria-hidden />
          {d.direction === "flat" ? "0%" : `${d.pct}%`}
          <span className="sr-only">versus previous period</span>
        </span>
      </div>

      <ul className="flex flex-col gap-2">
        <Row label="Within SLA" count={perf.within} pct={pct(perf.within)} dot="bg-emerald-500" text="text-emerald-700" />
        <Row label="Approaching SLA" count={perf.approaching} pct={pct(perf.approaching)} dot="bg-amber-500" text="text-amber-800" />
        <Row label="Breached SLA" count={perf.breached} pct={pct(perf.breached)} dot="bg-red-500" text="text-red-700" />
        <Row label="Completed within SLA" count={perf.completedWithin} pct={pct(perf.completedWithin)} dot="bg-emerald-400" text="text-emerald-700" />
        <Row label="Resolved after breach" count={perf.resolvedAfterBreach} pct={pct(perf.resolvedAfterBreach)} dot="bg-amber-400" text="text-amber-800" />
      </ul>

      <div className="rounded-md border border-[#EAECEE] bg-surface-muted px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Default SLA policy</p>
        <ul className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-slate-600">
          <li>Low — {SLA_TARGETS.Low.label}</li>
          <li>High — {SLA_TARGETS.High.label}</li>
          <li>Medium — {SLA_TARGETS.Medium.label}</li>
          <li>Critical — {SLA_TARGETS.Critical.label}</li>
        </ul>
      </div>

      {SLA_CONFIG.pauseSlaWhileWaitingForEmployee && (
        <p className="flex items-start gap-1.5 text-[11px] text-slate-400">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
          Config note: SLA pauses while waiting for the employee — prototype assumption pending HR confirmation.
        </p>
      )}
    </div>
  );
}
