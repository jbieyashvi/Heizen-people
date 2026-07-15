"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import type { MessageAttachment } from "@/lib/types";
import { useAttachments } from "@/lib/support/useAttachments";
import { RichTextArea } from "./RichTextArea";
import { AttachmentPicker } from "./AttachmentPicker";

interface ReplyComposerProps {
  onSend: (input: { bodyHtml: string; attachments: MessageAttachment[] }) => void;
}

export function ReplyComposer({ onSend }: ReplyComposerProps) {
  const [html, setHtml] = useState("");
  const [text, setText] = useState("");
  const [editorKey, setEditorKey] = useState(0);
  const { files, addFiles, remove, reset, valid, toMessageAttachments } = useAttachments();

  const canSend = text.trim().length > 0 || valid.length > 0;

  function handleSend() {
    if (!canSend) return;
    onSend({ bodyHtml: html || `<p>${text}</p>`, attachments: toMessageAttachments() });
    // Clear composer.
    setHtml("");
    setText("");
    reset();
    setEditorKey((k) => k + 1);
  }

  return (
    <div className="flex flex-col gap-3">
      <RichTextArea
        key={editorKey}
        ariaLabel="Write a reply"
        placeholder="Write a reply…"
        onChange={(nextHtml, nextText) => {
          setHtml(nextHtml);
          setText(nextText);
        }}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <AttachmentPicker files={files} onAddFiles={addFiles} onRemove={remove} />
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-md bg-heizen-500 px-4 text-sm font-medium text-white outline-none transition-colors hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          <Send className="h-4 w-4" strokeWidth={2} aria-hidden />
          Send Reply
        </button>
      </div>
    </div>
  );
}
