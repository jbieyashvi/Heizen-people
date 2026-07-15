import type { TicketDetail } from "@/lib/types";
import { formatDisplayDate } from "@/lib/support/dateFormat";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <dt className="text-xs font-medium text-slate-400">{label}</dt>
      <dd className="min-w-0 text-right text-sm font-medium text-slate-700">{children}</dd>
    </div>
  );
}

export function TicketMetaSidebar({ detail }: { detail: TicketDetail }) {
  const attachmentCount = detail.messages.reduce((n, m) => n + m.attachments.length, 0);

  return (
    <dl className="divide-y divide-[#EAECEE]">
      <Row label="Ticket ID">
        <span className="font-mono text-heizen-700">{detail.id}</span>
      </Row>
      <Row label="Category">{detail.category}</Row>
      <Row label="Request Type">{detail.requestType}</Row>
      <Row label="Priority">
        <PriorityBadge priority={detail.priority} />
      </Row>
      <Row label="Status">
        <StatusBadge status={detail.status} />
      </Row>
      <Row label="Assigned Team">{detail.assignedTeam}</Row>
      <Row label="Created">{formatDisplayDate(detail.createdAt)}</Row>
      <Row label="Last Updated">{formatDisplayDate(detail.updatedAt)}</Row>
      <Row label="Attachments">{attachmentCount}</Row>
    </dl>
  );
}
