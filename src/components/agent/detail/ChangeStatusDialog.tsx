"use client";

import { useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TicketStatus } from "@/lib/types";
import { Dialog } from "@/components/ui/Dialog";
import { allowedTransitions } from "@/lib/support/statusTransitions";

interface ChangeStatusDialogProps {
  open: boolean;
  currentStatus: TicketStatus;
  onClose: () => void;
  onConfirm: (status: TicketStatus, opts?: { resolutionSummary?: string; closingNote?: string }) => void;
}

const RELABEL: Partial<Record<TicketStatus, string>> = { "In Progress": "In Progress (Reopen)" };

export function ChangeStatusDialog({ open, currentStatus, onClose, onConfirm }: ChangeStatusDialogProps) {
  const options = allowedTransitions(currentStatus);
  const [selected, setSelected] = useState<TicketStatus | null>(null);
  const [summary, setSummary] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSelected(null);
      setSummary("");
      setNote("");
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  const needsSummary = selected === "Resolved";
  const needsNote = selected === "Closed";

  function confirm() {
    if (!selected) {
      setError("Select a status.");
      return;
    }
    if (needsSummary && summary.trim().length === 0) {
      setError("A short resolution summary is required.");
      return;
    }
    if (needsNote && note.trim().length === 0) {
      setError("A closing note is required.");
      return;
    }
    onConfirm(selected, {
      resolutionSummary: needsSummary ? summary.trim() : undefined,
      closingNote: needsNote ? note.trim() : undefined,
    });
  }

  return (
    <Dialog open={open} onClose={onClose} labelledBy="status-title" describedBy="status-desc">
      <h2 id="status-title" className="text-sm font-semibold text-slate-900">Change status</h2>
      <p id="status-desc" className="mt-0.5 text-xs text-slate-500">
        Current status: <span className="font-medium text-slate-700">{currentStatus}</span>
      </p>

      <fieldset className="mt-3">
        <legend className="sr-only">Select new status</legend>
        <div className="flex flex-col gap-1.5">
          {options.map((s) => (
            <label
              key={s}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2 text-sm outline-none transition-colors",
                selected === s ? "border-heizen-300 bg-heizen-50 text-heizen-800" : "border-[#EAECEE] bg-white text-slate-700 hover:bg-slate-50",
              )}
            >
              <input
                type="radio"
                name="new-status"
                checked={selected === s}
                onChange={() => {
                  setSelected(s);
                  setError(null);
                }}
                className="sr-only"
              />
              <span className={cn("h-3.5 w-3.5 rounded-full border", selected === s ? "border-heizen-500 bg-heizen-500" : "border-slate-300")} aria-hidden />
              {RELABEL[s] ?? s}
            </label>
          ))}
        </div>
      </fieldset>

      {needsSummary && (
        <div className="mt-3">
          <label htmlFor="res-summary" className="mb-1 block text-xs font-medium text-slate-600">
            Resolution summary <span className="text-red-500">*</span>
          </label>
          <textarea
            id="res-summary"
            value={summary}
            onChange={(e) => { setSummary(e.target.value); setError(null); }}
            rows={3}
            placeholder="Summarise how the request was resolved…"
            className="w-full resize-none rounded-md border border-[#EAECEE] bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-heizen-300 focus:ring-2 focus:ring-heizen-100"
          />
        </div>
      )}

      {needsNote && (
        <div className="mt-3">
          <label htmlFor="close-note" className="mb-1 block text-xs font-medium text-slate-600">
            Closing note <span className="text-red-500">*</span>
          </label>
          <textarea
            id="close-note"
            value={note}
            onChange={(e) => { setNote(e.target.value); setError(null); }}
            rows={3}
            placeholder="Add a closing note or resolution summary…"
            className="w-full resize-none rounded-md border border-[#EAECEE] bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-heizen-300 focus:ring-2 focus:ring-heizen-100"
          />
          <p className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-700">
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
            The employee will no longer be able to reply or reopen through the normal flow.
          </p>
        </div>
      )}

      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}

      <div className="mt-4 flex justify-end gap-2.5">
        <button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400">
          Cancel
        </button>
        <button type="button" onClick={confirm} className="inline-flex h-9 items-center rounded-md bg-heizen-500 px-3.5 text-sm font-medium text-white outline-none hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-2">
          Confirm
        </button>
      </div>
    </Dialog>
  );
}
