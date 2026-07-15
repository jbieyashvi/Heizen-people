"use client";

import { useEffect, useRef, useState } from "react";
import { Send, ChevronDown } from "lucide-react";
import type { MessageAttachment } from "@/lib/types";
import type { ReplyFollowUp } from "@/lib/support/statusTransitions";
import { useAttachments } from "@/lib/support/useAttachments";
import { RichTextArea } from "@/components/support/tickets/detail/RichTextArea";
import { AttachmentPicker } from "@/components/support/tickets/detail/AttachmentPicker";

interface AgentReplyComposerProps {
  onSend: (input: { bodyHtml: string; attachments: MessageAttachment[] }, followUp: ReplyFollowUp) => void;
}

const OPTIONS: { value: ReplyFollowUp; label: string }[] = [
  { value: "wait", label: "Send Reply and Wait for Employee" },
  { value: "resolve", label: "Send Reply and Resolve" },
];

export function AgentReplyComposer({ onSend }: AgentReplyComposerProps) {
  const [html, setHtml] = useState("");
  const [text, setText] = useState("");
  const [editorKey, setEditorKey] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { files, addFiles, remove, reset, valid, toMessageAttachments } = useAttachments();

  const canSend = text.trim().length > 0 || valid.length > 0;

  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  function send(followUp: ReplyFollowUp) {
    if (!canSend) return;
    onSend({ bodyHtml: html || `<p>${text}</p>`, attachments: toMessageAttachments() }, followUp);
    setHtml("");
    setText("");
    reset();
    setEditorKey((k) => k + 1);
    setMenuOpen(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <RichTextArea
        key={editorKey}
        ariaLabel="Write a public reply"
        placeholder="Write a reply to the employee…"
        onChange={(nextHtml, nextText) => {
          setHtml(nextHtml);
          setText(nextText);
        }}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <AttachmentPicker files={files} onAddFiles={addFiles} onRemove={remove} />
        <div className="relative flex shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => send("none")}
            disabled={!canSend}
            className="inline-flex h-9 items-center gap-1.5 rounded-l-md bg-heizen-500 px-4 text-sm font-medium text-white outline-none transition-colors hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            <Send className="h-4 w-4" strokeWidth={2} aria-hidden />
            Send Reply
          </button>
          <button
            type="button"
            aria-label="More send options"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            disabled={!canSend}
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex h-9 items-center rounded-r-md border-l border-heizen-600/40 bg-heizen-500 px-1.5 text-white outline-none transition-colors hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            <ChevronDown className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
          {menuOpen && (
            <div role="menu" className="absolute bottom-11 right-0 z-20 w-64 overflow-hidden rounded-md border border-[#EAECEE] bg-white py-1 shadow-panel">
              {OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="menuitem"
                  onClick={() => send(opt.value)}
                  className="flex w-full items-center px-3 py-2 text-left text-sm text-slate-600 outline-none hover:bg-slate-50 focus-visible:bg-slate-50"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
