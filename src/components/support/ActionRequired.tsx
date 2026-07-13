import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { actionRequired } from "@/lib/data/summary";

export function ActionRequired() {
  const { ticketId, subject, team, message } = actionRequired;

  return (
    <section
      aria-labelledby="action-required-heading"
      className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50/60 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex gap-3">
        <AlertCircle
          className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
          strokeWidth={1.75}
          aria-hidden
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 id="action-required-heading" className="text-sm font-semibold text-slate-900">
              {subject}
            </h3>
            <span className="rounded border border-amber-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-amber-700">
              {team}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{message}</p>
          <p className="mt-1 text-xs font-medium text-slate-400">{ticketId}</p>
        </div>
      </div>
      <Link
        href={`/support/tickets/${ticketId}`}
        className="inline-flex h-9 shrink-0 items-center gap-1.5 self-start rounded-md bg-amber-500 px-3.5 text-sm font-medium text-white outline-none transition-colors hover:bg-amber-600 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 sm:self-auto"
      >
        Respond Now
        <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
      </Link>
    </section>
  );
}
