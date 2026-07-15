import Link from "next/link";
import { Inbox, SearchX, TriangleAlert, Plus, RotateCcw } from "lucide-react";

function StateShell({
  icon: Icon,
  tone = "neutral",
  title,
  description,
  children,
}: {
  icon: typeof Inbox;
  tone?: "neutral" | "warning";
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-[#DDE1E4] bg-white px-6 py-16 text-center">
      <span
        className={
          tone === "warning"
            ? "flex h-12 w-12 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600"
            : "flex h-12 w-12 items-center justify-center rounded-lg border border-[#EAECEE] bg-surface-muted text-slate-400"
        }
      >
        <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
      </span>
      <div className="max-w-md">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        <p className="mt-1.5 text-sm text-slate-500">{description}</p>
      </div>
      {children}
    </div>
  );
}

const primaryBtn =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-heizen-500 px-3.5 text-sm font-medium text-white outline-none transition-colors hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-2";
const secondaryBtn =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400";

/** No tickets exist at all. */
export function NoTicketsState() {
  return (
    <StateShell
      icon={Inbox}
      title="You haven't raised any tickets yet"
      description="When you raise a support request, it will appear here so you can track its progress."
    >
      <Link href="/support/new" className={primaryBtn}>
        <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
        Raise New Ticket
      </Link>
    </StateShell>
  );
}

/** Tickets exist, but none match the current filters. */
export function NoResultsState({ onClear }: { onClear: () => void }) {
  return (
    <StateShell
      icon={SearchX}
      title="No tickets match your current filters"
      description="Try adjusting your search or filters to find what you're looking for."
    >
      <button type="button" onClick={onClear} className={secondaryBtn}>
        <RotateCcw className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden />
        Clear Filters
      </button>
    </StateShell>
  );
}

/** Data failed to load. */
export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <StateShell
      icon={TriangleAlert}
      tone="warning"
      title="We couldn't load your tickets"
      description="Something went wrong while loading your support requests. Please try again."
    >
      <button type="button" onClick={onRetry} className={secondaryBtn}>
        <RotateCcw className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden />
        Retry
      </button>
    </StateShell>
  );
}
