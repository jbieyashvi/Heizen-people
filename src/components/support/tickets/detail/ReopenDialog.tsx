"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import type { MessageAttachment } from "@/lib/types";
import { Dialog } from "@/components/ui/Dialog";
import { useAttachments } from "@/lib/support/useAttachments";
import { AttachmentPicker } from "./AttachmentPicker";

interface ReopenDialogProps {
  open: boolean;
  onCancel: () => void;
  onReopen: (input: { reason: string; attachments: MessageAttachment[] }) => void;
}

export function ReopenDialog({ open, onCancel, onReopen }: ReopenDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { files, addFiles, remove, reset, toMessageAttachments } = useAttachments();

  function close() {
    setReason("");
    setError(null);
    reset();
    onCancel();
  }

  function submit() {
    if (reason.trim().length === 0) {
      setError("Please add a short reason for reopening.");
      return;
    }
    onReopen({ reason: reason.trim(), attachments: toMessageAttachments() });
    setReason("");
    setError(null);
    reset();
  }

  if (!open) return null;

  return (
    <Dialog open={open} onClose={close} labelledBy="reopen-title" describedBy="reopen-desc">
      <div className="flex gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-heizen-100 bg-heizen-50 text-heizen-700">
          <RotateCcw className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="reopen-title" className="text-sm font-semibold text-slate-900">
            Reopen this ticket?
          </h2>
          <p id="reopen-desc" className="mt-1 text-sm text-slate-500">
            Tell the support team what still needs attention. This will return the ticket to them.
          </p>

          <div className="mt-4 flex flex-col gap-1.5">
            <label htmlFor="reopen-reason" className="text-xs font-medium text-slate-600">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reopen-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              rows={3}
              placeholder="e.g. The issue happened again after the fix."
              aria-invalid={error ? true : undefined}
              className="w-full resize-none rounded-md border border-[#EAECEE] bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-heizen-300 focus:ring-2 focus:ring-heizen-100"
            />
            {error && <p className="text-xs font-medium text-red-600">{error}</p>}
          </div>

          <div className="mt-3">
            <AttachmentPicker
              files={files}
              onAddFiles={addFiles}
              onRemove={remove}
              label="Attach a file (optional)"
            />
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2.5">
        <button
          type="button"
          onClick={close}
          className="inline-flex h-9 items-center rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-heizen-500 px-3.5 text-sm font-medium text-white outline-none hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-2"
        >
          <RotateCcw className="h-4 w-4" strokeWidth={2} aria-hidden />
          Reopen Ticket
        </button>
      </div>
    </Dialog>
  );
}
