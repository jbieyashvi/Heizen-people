import { Info, Users } from "lucide-react";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import type { AssignedTeam, TicketPriority } from "@/lib/types";

interface RequestSummaryProps {
  categoryLabel: string | null;
  requestType: string | null;
  priority: TicketPriority;
  attachmentCount: number;
  assignedTeam: AssignedTeam | null;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <dt className="text-xs font-medium text-slate-400">{label}</dt>
      <dd className="text-right text-sm text-slate-700">{children}</dd>
    </div>
  );
}

const PLACEHOLDER = <span className="text-slate-300">Not selected</span>;

export function RequestSummary({
  categoryLabel,
  requestType,
  priority,
  attachmentCount,
  assignedTeam,
}: RequestSummaryProps) {
  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-20">
      <section
        aria-label="Request summary"
        className="rounded-lg border border-[#EAECEE] bg-white p-4"
      >
        <h3 className="text-sm font-semibold text-slate-800">Request summary</h3>
        <dl className="mt-1 divide-y divide-[#EAECEE]">
          <Row label="Category">{categoryLabel ?? PLACEHOLDER}</Row>
          <Row label="Request type">{requestType ?? PLACEHOLDER}</Row>
          <Row label="Priority">
            <PriorityBadge priority={priority} />
          </Row>
          <Row label="Attachments">
            <span className="tabular-nums">{attachmentCount}</span>
          </Row>
          <Row label="Assigned team">
            {assignedTeam ? (
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-heizen-600" strokeWidth={1.75} aria-hidden />
                {assignedTeam}
              </span>
            ) : (
              PLACEHOLDER
            )}
          </Row>
        </dl>
      </section>

      <div className="flex gap-2.5 rounded-lg border border-[#EAECEE] bg-surface-muted p-3.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-heizen-600" strokeWidth={1.75} aria-hidden />
        <p className="text-xs leading-relaxed text-slate-500">
          After submission, you&rsquo;ll receive a ticket ID and updates through the portal and email.
        </p>
      </div>
    </div>
  );
}
