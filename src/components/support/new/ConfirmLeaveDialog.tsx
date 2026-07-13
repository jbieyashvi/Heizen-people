"use client";

import { useEffect, useRef } from "react";
import { TriangleAlert } from "lucide-react";

interface ConfirmLeaveDialogProps {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}

/** Accessible confirm dialog for discarding unsaved ticket input. */
export function ConfirmLeaveDialog({ open, onStay, onLeave }: ConfirmLeaveDialogProps) {
  const leaveRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    leaveRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onStay();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onStay]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4"
      onMouseDown={onStay}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="leave-dialog-title"
        aria-describedby="leave-dialog-desc"
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-lg border border-[#EAECEE] bg-white p-5 shadow-panel"
      >
        <div className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-100 bg-amber-50 text-amber-600">
            <TriangleAlert className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <h2 id="leave-dialog-title" className="text-sm font-semibold text-slate-900">
              Discard this ticket?
            </h2>
            <p id="leave-dialog-desc" className="mt-1 text-sm text-slate-500">
              You have unsaved changes. If you leave now, the details you entered will be lost.
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onStay}
            className="inline-flex h-9 items-center rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400"
          >
            Stay on page
          </button>
          <button
            ref={leaveRef}
            type="button"
            onClick={onLeave}
            className="inline-flex h-9 items-center rounded-md bg-red-600 px-3.5 text-sm font-medium text-white outline-none hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
          >
            Discard &amp; leave
          </button>
        </div>
      </div>
    </div>
  );
}
