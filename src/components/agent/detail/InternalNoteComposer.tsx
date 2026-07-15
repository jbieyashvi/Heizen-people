"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import type { MessageAttachment } from "@/lib/types";
import { useAttachments } from "@/lib/support/useAttachments";
import { RichTextArea } from "@/components/support/tickets/detail/RichTextArea";
import { AttachmentPicker } from "@/components/support/tickets/detail/AttachmentPicker";

interface InternalNoteComposerProps {
  onSubmit: (input: { bodyHtml: string; attachments: MessageAttachment[] }) => void;
}

export function InternalNoteComposer({ onSubmit }: InternalNoteComposerProps) {
  const [html, setHtml] = useState("");
  const [text, setText] = useState("");
  const [editorKey, setEditorKey] = useState(0);
  const { files, addFiles, remove, reset, valid, toMessageAttachments } = useAttachments();

  const canSubmit = text.trim().length > 0 || valid.length > 0;

  function submit() {
    if (!canSubmit) return;
    onSubmit({ bodyHtml: html || `<p>${text}</p>`, attachments: toMessageAttachments() });
    setHtml("");
    setText("");
    reset();
    setEditorKey((k) => k + 1);
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50/40 p-3">
      <RichTextArea
        key={editorKey}
        ariaLabel="Write an internal note"
        placeholder="Add a support-only note…"
        onChange={(nextHtml, nextText) => {
          setHtml(nextHtml);
          setText(nextText);
        }}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <AttachmentPicker files={files} onAddFiles={addFiles} onRemove={remove} label="Attach files (internal)" />
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-md bg-amber-500 px-4 text-sm font-medium text-white outline-none transition-colors hover:bg-amber-600 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          <Lock className="h-4 w-4" strokeWidth={2} aria-hidden />
          Add Internal Note
        </button>
      </div>
    </div>
  );
}
