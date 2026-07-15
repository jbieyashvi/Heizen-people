import Link from "next/link";
import { FileQuestion, ArrowLeft, Plus } from "lucide-react";

export function TicketNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-[#DDE1E4] bg-white px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#EAECEE] bg-surface-muted text-slate-400">
        <FileQuestion className="h-6 w-6" strokeWidth={1.5} aria-hidden />
      </span>
      <div className="max-w-md">
        <h2 className="text-base font-semibold text-slate-800">Ticket not found</h2>
        <p className="mt-1.5 text-sm text-slate-500">
          We couldn&rsquo;t find a ticket with that ID. It may have been removed, or the link may be
          incorrect.
        </p>
      </div>
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <Link
          href="/support/tickets"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400"
        >
          <ArrowLeft className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden />
          Back to My Tickets
        </Link>
        <Link
          href="/support/new"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-heizen-500 px-3.5 text-sm font-medium text-white outline-none transition-colors hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
          Raise New Ticket
        </Link>
      </div>
    </div>
  );
}
