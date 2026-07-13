import Link from "next/link";
import { CircleCheck, ArrowRight, RotateCcw, LayoutGrid } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import type { StoredTicket } from "@/lib/types";

interface SuccessStateProps {
  ticket: StoredTicket;
  onRaiseAnother: () => void;
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-xs font-medium text-slate-400">{label}</span>
      <span className="text-right text-sm font-medium text-slate-700">{children}</span>
    </div>
  );
}

export function SuccessState({ ticket, onRaiseAnother }: SuccessStateProps) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-600">
        <CircleCheck className="h-6 w-6" strokeWidth={1.75} aria-hidden />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">Ticket submitted successfully</h2>
      <p className="mt-1 max-w-md text-sm text-slate-500">
        We&rsquo;ve notified the relevant support team. You&rsquo;ll receive updates through the portal and email.
      </p>

      <div className="mt-6 w-full rounded-lg border border-[#EAECEE] bg-white p-4 text-left">
        <div className="flex items-center justify-between border-b border-[#EAECEE] pb-2.5">
          <span className="text-xs font-medium text-slate-400">Ticket ID</span>
          <span className="font-mono text-sm font-semibold text-heizen-700">{ticket.id}</span>
        </div>
        <dl className="divide-y divide-[#EAECEE]">
          <DetailRow label="Subject">{ticket.subject}</DetailRow>
          <DetailRow label="Assigned team">{ticket.assignedTeam}</DetailRow>
          <DetailRow label="Priority">
            <PriorityBadge priority={ticket.priority} />
          </DetailRow>
          <DetailRow label="Status">
            <StatusBadge status={ticket.status} />
          </DetailRow>
        </dl>
      </div>

      <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row sm:justify-center">
        <Link
          href={`/support/tickets/${ticket.id}`}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-heizen-500 px-3.5 text-sm font-medium text-white outline-none transition-colors hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-2"
        >
          View Ticket
          <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
        </Link>
        <Link
          href="/support"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400"
        >
          <LayoutGrid className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden />
          Back to Support Center
        </Link>
        <button
          type="button"
          onClick={onRaiseAnother}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400"
        >
          <RotateCcw className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden />
          Raise Another Ticket
        </button>
      </div>
    </div>
  );
}
