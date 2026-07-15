"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/cn";
import type { MessageAttachment, TicketDetail } from "@/lib/types";
import type { ReplyFollowUp } from "@/lib/support/statusTransitions";
import { ConversationThread } from "@/components/support/tickets/detail/ConversationThread";
import { AgentReplyComposer } from "@/components/agent/detail/AgentReplyComposer";
import { InternalNotesList } from "@/components/agent/detail/InternalNotesList";
import { InternalNoteComposer } from "@/components/agent/detail/InternalNoteComposer";

interface ConversationPanelProps {
  detail: TicketDetail;
  closed: boolean;
  onReply: (input: { bodyHtml: string; attachments: MessageAttachment[] }, followUp: ReplyFollowUp) => void;
  onNote: (input: { bodyHtml: string; attachments: MessageAttachment[] }) => void;
}

type Tab = "conversation" | "internal";

export function ConversationPanel({ detail, closed, onReply, onNote }: ConversationPanelProps) {
  const [tab, setTab] = useState<Tab>("conversation");

  const publicMessages = detail.messages.filter((m) => m.visibility !== "internal");
  const internalNotes = detail.messages.filter((m) => m.visibility === "internal");

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-[#EAECEE] bg-white p-4">
      {/* Tabs */}
      <div role="tablist" aria-label="Conversation and internal notes" className="flex items-center gap-1 border-b border-[#EAECEE]">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "conversation"}
          onClick={() => setTab("conversation")}
          className={cn(
            "-mb-px border-b-2 px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-heizen-400",
            tab === "conversation" ? "border-heizen-500 text-heizen-700" : "border-transparent text-slate-500 hover:text-slate-700",
          )}
        >
          Conversation
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "internal"}
          onClick={() => setTab("internal")}
          className={cn(
            "-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-heizen-400",
            tab === "internal" ? "border-amber-400 text-amber-700" : "border-transparent text-slate-500 hover:text-slate-700",
          )}
        >
          <Lock className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          Internal Notes
          {internalNotes.length > 0 && (
            <span className="rounded bg-amber-100 px-1.5 text-[11px] font-semibold text-amber-700">{internalNotes.length}</span>
          )}
        </button>
      </div>

      {tab === "conversation" ? (
        <>
          {publicMessages.length > 0 ? (
            <ConversationThread messages={publicMessages} />
          ) : (
            <p className="text-sm text-slate-400">No conversation yet.</p>
          )}
          {closed ? (
            <div className="flex items-center gap-2.5 rounded-lg border border-[#EAECEE] bg-surface-muted px-4 py-3">
              <Lock className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.75} aria-hidden />
              <p className="text-sm text-slate-500">This ticket is closed. The conversation is read-only.</p>
            </div>
          ) : (
            <div className="border-t border-[#EAECEE] pt-4">
              <AgentReplyComposer onSend={onReply} />
            </div>
          )}
        </>
      ) : (
        <>
          <InternalNotesList notes={internalNotes} />
          {/* Internal notes remain available even on closed tickets. */}
          <div className="border-t border-[#EAECEE] pt-4">
            <InternalNoteComposer onSubmit={onNote} />
          </div>
        </>
      )}
    </section>
  );
}
