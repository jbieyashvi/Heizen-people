"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TicketRecord } from "@/lib/types";
import { Dialog } from "@/components/ui/Dialog";
import { formatDisplayDate } from "@/lib/support/dateFormat";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface MergeModalProps {
  open: boolean;
  primaryId: string;
  candidates: TicketRecord[];
  onClose: () => void;
  onConfirm: (duplicateId: string) => void;
}

export function MergeModal({ open, primaryId, candidates, onClose, onConfirm }: MergeModalProps) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setSelected(null);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return candidates;
    return candidates.filter((c) => `${c.id} ${c.subject}`.toLowerCase().includes(query));
  }, [candidates, q]);

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} labelledBy="merge-title">
      <h2 id="merge-title" className="text-sm font-semibold text-slate-900">Merge tickets</h2>
      <p className="mt-0.5 text-xs text-slate-500">
        Keep <span className="font-mono font-medium text-slate-700">{primaryId}</span> as the primary ticket and merge the
        selected duplicate into it. Only this employee&rsquo;s open People Operations tickets are shown.
      </p>

      <div className="relative mt-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={1.75} aria-hidden />
        <label htmlFor="merge-search" className="sr-only">Search tickets by ID or subject</label>
        <input
          id="merge-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search ticket ID or subject…"
          className="h-9 w-full rounded-md border border-[#EAECEE] bg-white pl-9 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-heizen-300 focus:ring-2 focus:ring-heizen-100"
        />
      </div>

      <div className="mt-3 max-h-64 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">No matching tickets to merge.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {filtered.map((c) => (
              <li key={c.id}>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 outline-none transition-colors",
                    selected === c.id ? "border-heizen-300 bg-heizen-50" : "border-[#EAECEE] bg-white hover:bg-slate-50",
                  )}
                >
                  <input type="radio" name="merge-target" checked={selected === c.id} onChange={() => setSelected(c.id)} className="sr-only" />
                  <span className={cn("h-3.5 w-3.5 shrink-0 rounded-full border", selected === c.id ? "border-heizen-500 bg-heizen-500" : "border-slate-300")} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-xs font-medium text-slate-700">{c.id}</span>
                      <StatusBadge status={c.status} label={c.status} />
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-slate-600" title={c.subject}>{c.subject}</span>
                    <span className="text-[11px] text-slate-400">Created {formatDisplayDate(c.createdAt)}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 flex justify-end gap-2.5">
        <button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400">
          Cancel
        </button>
        <button type="button" disabled={!selected} onClick={() => selected && onConfirm(selected)} className="inline-flex h-9 items-center rounded-md bg-heizen-500 px-3.5 text-sm font-medium text-white outline-none hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">
          Merge &amp; Close Duplicate
        </button>
      </div>
    </Dialog>
  );
}
