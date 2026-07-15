import { Inbox, SearchX } from "lucide-react";
import type { QueueDef } from "@/lib/agent/queues";

interface QueueEmptyStateProps {
  queue: QueueDef;
  filtersActive: boolean;
  onClear: () => void;
}

export function QueueEmptyState({ queue, filtersActive, onClear }: QueueEmptyStateProps) {
  const Icon = filtersActive ? SearchX : Inbox;
  const title = filtersActive ? "No tickets match the selected filters." : queue.emptyMessage;

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[#DDE1E4] bg-white px-6 py-16 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#EAECEE] bg-surface-muted text-slate-400">
        <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
      </span>
      <p className="max-w-sm text-sm font-medium text-slate-600">{title}</p>
      {filtersActive && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex h-9 items-center rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
