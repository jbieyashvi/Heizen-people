"use client";

import { RefreshCw } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import type { QueueDef } from "@/lib/agent/queues";

interface QueueHeaderProps {
  queue: QueueDef;
  resultCount: number;
  lastRefreshed: string;
  onRefresh: () => void;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function QueueHeader({ queue, resultCount, lastRefreshed, onRefresh }: QueueHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      <Breadcrumb items={[{ label: "Support", href: "/agent/dashboard" }, { label: "Tickets" }]} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-semibold text-slate-900">{queue.label}</h2>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-600">
              {resultCount}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-slate-500">{queue.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Last refreshed {formatTime(lastRefreshed)}</span>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-3 text-sm font-medium text-slate-600 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400"
          >
            <RefreshCw className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
