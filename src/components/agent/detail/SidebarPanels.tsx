import Link from "next/link";
import { Mail } from "lucide-react";
import type { TicketDetail } from "@/lib/types";
import { formatDisplayDate } from "@/lib/support/dateFormat";
import { getEmployeeProfile } from "@/lib/data/employeeDirectory";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <dt className="shrink-0 text-xs font-medium text-slate-400">{label}</dt>
      <dd className="min-w-0 truncate text-right text-sm font-medium text-slate-700">{children}</dd>
    </div>
  );
}

interface RecordFields {
  employeeName: string;
  employeeId: string;
  employeeDepartment: string;
  assignedTeam: string;
  assignedAgent: string | null;
  assignedDate?: string;
}

export function TicketInfoPanel({ detail }: { detail: TicketDetail }) {
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
        <StatusBadge status={detail.status} label={detail.status} />
      </Row>
      <Row label="Assigned Team">{detail.assignedTeam}</Row>
      <Row label="Created">{formatDisplayDate(detail.createdAt)}</Row>
      <Row label="Last Updated">{formatDisplayDate(detail.updatedAt)}</Row>
      <Row label="Attachments">{attachmentCount}</Row>
      <Row label="Source">Employee Portal</Row>
    </dl>
  );
}

export function EmployeeInfoPanel({ record }: { record: RecordFields }) {
  const p = getEmployeeProfile(record.employeeName, record.employeeId, record.employeeDepartment);
  return (
    <dl className="divide-y divide-[#EAECEE]">
      <Row label="Name">{p.name}</Row>
      <Row label="Employee ID">
        <span className="font-mono text-slate-600">{p.id}</span>
      </Row>
      <Row label="Department">{p.department}</Row>
      <Row label="Job Title">{p.jobTitle}</Row>
      <Row label="Location">{p.location}</Row>
      <Row label="Work Email">
        <a
          href={`mailto:${p.email}`}
          className="inline-flex items-center gap-1 rounded text-heizen-700 outline-none hover:text-heizen-800 focus-visible:ring-2 focus-visible:ring-heizen-400"
        >
          <Mail className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} aria-hidden />
          {p.email}
        </a>
      </Row>
    </dl>
  );
}

export function AssignmentDetailsPanel({
  detail,
  workloadLabel,
  onManage,
}: {
  detail: TicketDetail;
  workloadLabel: string;
  onManage: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <dl className="divide-y divide-[#EAECEE]">
        <Row label="Assigned Team">{detail.assignedTeam}</Row>
        <Row label="Current Agent">
          {detail.assignedAgent ?? <span className="text-slate-400">Unassigned</span>}
        </Row>
        <Row label="Agent Workload">{detail.assignedAgent ? workloadLabel : "—"}</Row>
        <Row label="Assigned Date">{formatDisplayDate(detail.updatedAt)}</Row>
      </dl>
      <button
        type="button"
        onClick={onManage}
        className="inline-flex h-9 items-center justify-center rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400"
      >
        {detail.assignedAgent ? "Reassign" : "Assign"}
      </button>
    </div>
  );
}

export function RelatedMergedPanel({ detail }: { detail: TicketDetail }) {
  const merged = detail.mergedTicketIds ?? [];
  const into = detail.mergedIntoTicketId;

  if (merged.length === 0 && !into) {
    return <p className="text-sm text-slate-400">No related or merged tickets.</p>;
  }

  return (
    <ul className="flex flex-col gap-2 text-sm">
      {into && (
        <li className="flex items-center justify-between gap-2">
          <span className="text-slate-500">Merged into</span>
          <Link
            href={`/agent/tickets/${into}`}
            className="font-mono font-medium text-heizen-700 outline-none hover:text-heizen-800 focus-visible:ring-2 focus-visible:ring-heizen-400"
          >
            {into}
          </Link>
        </li>
      )}
      {merged.map((id) => (
        <li key={id} className="flex items-center justify-between gap-2">
          <span className="text-slate-500">Merged from</span>
          <Link
            href={`/agent/tickets/${id}`}
            className="font-mono font-medium text-heizen-700 outline-none hover:text-heizen-800 focus-visible:ring-2 focus-visible:ring-heizen-400"
          >
            {id}
          </Link>
        </li>
      ))}
    </ul>
  );
}
