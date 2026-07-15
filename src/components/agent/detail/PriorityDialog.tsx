"use client";

import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TicketPriority } from "@/lib/types";
import { Dialog } from "@/components/ui/Dialog";

interface PriorityDialogProps {
  open: boolean;
  currentPriority: TicketPriority;
  onClose: () => void;
  onConfirm: (priority: TicketPriority, reason?: string) => void;
}

const PRIORITIES: TicketPriority[] = ["Low", "Medium", "High", "Critical"];

export function PriorityDialog({ open, currentPriority, onClose, onConfirm }: PriorityDialogProps) {
  const [selected, setSelected] = useState<TicketPriority>(currentPriority);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSelected(currentPriority);
      setReason("");
      setError(null);
    }
  }, [open, currentPriority]);

  if (!open) return null;

  const needsReason = selected === "Critical";

  function confirm() {
    if (needsReason && reason.trim().length === 0) {
      setError("A short reason is required for Critical priority.");
      return;
    }
    onConfirm(selected, needsReason ? reason.trim() : undefined);
  }

  return (
    <Dialog open={open} onClose={onClose} labelledBy="priority-title">
      <h2 id="priority-title" className="text-sm font-semibold text-slate-900">Change priority</h2>
      <p className="mt-0.5 text-xs text-slate-500">Recalculates the SLA target for this ticket.</p>

      <fieldset className="mt-3">
        <legend className="sr-only">Select priority</legend>
        <div className="grid grid-cols-2 gap-2">
          {PRIORITIES.map((p) => (
            <label
              key={p}
              className={cn(
                "flex cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium outline-none transition-colors",
                selected === p ? "border-heizen-300 bg-heizen-50 text-heizen-800" : "border-[#EAECEE] bg-white text-slate-700 hover:bg-slate-50",
              )}
            >
              <input
                type="radio"
                name="priority"
                checked={selected === p}
                onChange={() => { setSelected(p); setError(null); }}
                className="sr-only"
              />
              {p}
            </label>
          ))}
        </div>
      </fieldset>

      <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={1.75} aria-hidden />
        Critical priority is restricted to the support team.
      </p>

      {needsReason && (
        <div className="mt-3">
          <label htmlFor="crit-reason" className="mb-1 block text-xs font-medium text-slate-600">
            Reason for Critical <span className="text-red-500">*</span>
          </label>
          <textarea
            id="crit-reason"
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError(null); }}
            rows={2}
            placeholder="Why is this Critical?"
            className="w-full resize-none rounded-md border border-[#EAECEE] bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-heizen-300 focus:ring-2 focus:ring-heizen-100"
          />
        </div>
      )}

      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}

      <div className="mt-4 flex justify-end gap-2.5">
        <button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400">
          Cancel
        </button>
        <button type="button" disabled={selected === currentPriority} onClick={confirm} className="inline-flex h-9 items-center rounded-md bg-heizen-500 px-3.5 text-sm font-medium text-white outline-none hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">
          Update Priority
        </button>
      </div>
    </Dialog>
  );
}
