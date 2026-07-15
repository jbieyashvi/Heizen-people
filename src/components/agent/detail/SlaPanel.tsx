import { Info } from "lucide-react";
import type { TicketDetail } from "@/lib/types";
import { SLA_CONFIG, SLA_TARGETS, computeSla } from "@/lib/agent/sla";
import { formatDisplayDateTime } from "@/lib/support/dateFormat";
import { SlaBadge } from "@/components/agent/SlaBadge";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <dt className="text-xs font-medium text-slate-400">{label}</dt>
      <dd className="text-right text-sm font-medium text-slate-700">{children}</dd>
    </div>
  );
}

export function SlaPanel({ detail, now }: { detail: TicketDetail; now: string }) {
  const sla = computeSla(detail, now);
  const target = SLA_TARGETS[detail.priority];

  const running =
    detail.status === "Resolved" || detail.status === "Closed"
      ? "Completed"
      : sla.state === "paused"
        ? "Paused"
        : "Running";

  return (
    <div className="flex flex-col gap-3">
      <SlaBadge sla={sla} />
      <dl className="divide-y divide-[#EAECEE]">
        <Row label="Resolution target">{target.label}</Row>
        <Row label="Priority policy">{detail.priority}</Row>
        <Row label="SLA status">{running}</Row>
        <Row label="SLA start">{formatDisplayDateTime(detail.createdAt)}</Row>
        <Row label="SLA due">{sla.dueAt ? formatDisplayDateTime(sla.dueAt) : "—"}</Row>
      </dl>
      {/* Internal-only note: never rendered in the employee view. */}
      {SLA_CONFIG.pauseSlaWhileWaitingForEmployee && (
        <p className="flex items-start gap-1.5 rounded-md border border-dashed border-amber-200 bg-amber-50/50 px-2.5 py-1.5 text-[11px] text-amber-700">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
          Prototype assumption — requires HR confirmation. SLA is paused while waiting for the employee.
        </p>
      )}
    </div>
  );
}
