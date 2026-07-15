import type { LucideIcon } from "lucide-react";
import { Inbox, TriangleAlert, RotateCcw } from "lucide-react";

/** Small inline empty state for a section (no blank cards). */
export function InlineEmpty({
  icon: Icon = Inbox,
  title,
  note,
}: {
  icon?: LucideIcon;
  title: string;
  note?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#EAECEE] bg-surface-muted text-slate-400">
        <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
      </span>
      <p className="text-sm font-medium text-slate-600">{title}</p>
      {note && <p className="max-w-xs text-xs text-slate-400">{note}</p>}
    </div>
  );
}

/** Data-load error with retry. */
export function ErrorPanel({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[#DDE1E4] bg-white px-6 py-14 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600">
        <TriangleAlert className="h-5 w-5" strokeWidth={1.5} aria-hidden />
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-800">We couldn&rsquo;t load ticket data</p>
        <p className="mt-1 text-xs text-slate-500">Something went wrong. Please try again.</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400"
      >
        <RotateCcw className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden />
        Retry
      </button>
    </div>
  );
}
