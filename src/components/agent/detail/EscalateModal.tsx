"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import type { TicketPriority } from "@/lib/types";
import { Dialog } from "@/components/ui/Dialog";

interface EscalateModalProps {
  open: boolean;
  currentPriority: TicketPriority;
  onClose: () => void;
  onConfirm: (input: { target: string; reason: string; note?: string }) => void;
}

const TARGETS = ["People Operations Lead", "HR Operations Manager"];

export function EscalateModal({ open, currentPriority, onClose, onConfirm }: EscalateModalProps) {
  const [target, setTarget] = useState<string>(TARGETS[0]);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTarget(TARGETS[0]);
      setReason("");
      setNote("");
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  function confirm() {
    if (reason.trim().length === 0) {
      setError("An escalation reason is required.");
      return;
    }
    onConfirm({ target, reason: reason.trim(), note: note.trim() || undefined });
  }

  return (
    <Dialog open={open} onClose={onClose} labelledBy="escalate-title">
      <h2 id="escalate-title" className="text-sm font-semibold text-slate-900">Escalate ticket</h2>
      <p className="mt-0.5 text-xs text-slate-500">
        Current priority: <span className="font-medium text-slate-700">{currentPriority}</span>. Escalation does not change priority.
      </p>

      <div className="mt-3">
        <label className="mb-1 block text-xs font-medium text-slate-600">Escalate to</label>
        <div className="flex flex-col gap-1.5">
          {TARGETS.map((t) => (
            <label
              key={t}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2 text-sm outline-none transition-colors",
                target === t ? "border-heizen-300 bg-heizen-50 text-heizen-800" : "border-[#EAECEE] bg-white text-slate-700 hover:bg-slate-50",
              )}
            >
              <input type="radio" name="escalate-target" checked={target === t} onChange={() => setTarget(t)} className="sr-only" />
              <span className={cn("h-3.5 w-3.5 rounded-full border", target === t ? "border-heizen-500 bg-heizen-500" : "border-slate-300")} aria-hidden />
              {t}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <label htmlFor="esc-reason" className="mb-1 block text-xs font-medium text-slate-600">
          Escalation reason <span className="text-red-500">*</span>
        </label>
        <textarea id="esc-reason" value={reason} onChange={(e) => { setReason(e.target.value); setError(null); }} rows={2}
          placeholder="Why is this being escalated?"
          className="w-full resize-none rounded-md border border-[#EAECEE] bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-heizen-300 focus:ring-2 focus:ring-heizen-100" />
      </div>

      <div className="mt-3">
        <label htmlFor="esc-note" className="mb-1 block text-xs font-medium text-slate-600">Internal note (optional)</label>
        <textarea id="esc-note" value={note} onChange={(e) => setNote(e.target.value)} rows={2}
          placeholder="Add context for the support team…"
          className="w-full resize-none rounded-md border border-[#EAECEE] bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-heizen-300 focus:ring-2 focus:ring-heizen-100" />
      </div>

      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}

      <div className="mt-4 flex justify-end gap-2.5">
        <button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400">
          Cancel
        </button>
        <button type="button" onClick={confirm} className="inline-flex h-9 items-center rounded-md bg-amber-500 px-3.5 text-sm font-medium text-white outline-none hover:bg-amber-600 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2">
          Confirm Escalation
        </button>
      </div>
    </Dialog>
  );
}
