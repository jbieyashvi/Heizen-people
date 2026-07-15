import type { WorkloadMetrics } from "@/lib/agent/agentTickets";

function formatResponse(ms: number | null): string {
  if (ms === null) return "—";
  const hours = ms / (60 * 60 * 1000);
  if (hours >= 1) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${Math.max(1, Math.round(ms / (60 * 1000)))}m`;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-2 first:pl-0">
      <span className="text-lg font-semibold tabular-nums text-slate-900">{value}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

export function WorkloadSummary({ metrics }: { metrics: WorkloadMetrics }) {
  return (
    <div className="flex flex-wrap divide-x divide-[#EAECEE]">
      <Metric label="Open assigned" value={String(metrics.openAssigned)} />
      <Metric label="Resolved today" value={String(metrics.resolvedToday)} />
      <Metric label="Avg first response" value={formatResponse(metrics.avgFirstResponseMs)} />
      <Metric label="SLA compliance" value={`${metrics.slaCompliancePct}%`} />
    </div>
  );
}
