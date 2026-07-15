"use client";

import { Headset, Download, Paperclip } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ConversationMessage } from "@/lib/types";
import { formatDisplayDateTime } from "@/lib/support/dateFormat";
import { formatFileSize } from "@/lib/support/fileSize";
import { downloadMockFile } from "@/lib/support/downloadMock";

function initialsOf(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function MessageItem({ message }: { message: ConversationMessage }) {
  const isEmployee = message.author === "employee";
  return (
    <li className="flex gap-3">
      {/* Avatar / role marker */}
      {isEmployee ? (
        <span className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md bg-heizen-100 text-xs font-semibold text-heizen-700">
          {initialsOf(message.authorName)}
        </span>
      ) : (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
          <Headset className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </span>
      )}

      <div
        className={cn(
          "min-w-0 flex-1 rounded-lg border px-3.5 py-2.5",
          isEmployee ? "border-heizen-100 bg-heizen-50/40" : "border-[#EAECEE] bg-white",
        )}
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-sm font-semibold text-slate-800">{message.authorName}</span>
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[11px] font-medium",
              isEmployee ? "bg-heizen-100 text-heizen-700" : "bg-slate-100 text-slate-500",
            )}
          >
            {isEmployee ? "You" : message.authorMeta}
          </span>
          <span className="text-xs text-slate-400">{formatDisplayDateTime(message.createdAt)}</span>
        </div>

        <div
          className="prose-editor mt-1.5 text-sm leading-relaxed text-slate-700"
          dangerouslySetInnerHTML={{ __html: message.bodyHtml }}
        />

        {message.attachments.length > 0 && (
          <ul className="mt-2.5 flex flex-wrap gap-2">
            {message.attachments.map((att) => (
              <li key={att.id}>
                <button
                  type="button"
                  onClick={() => downloadMockFile(att.name)}
                  className="group inline-flex items-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-2 py-1 text-xs text-slate-600 outline-none transition-colors hover:border-heizen-200 hover:bg-heizen-50 focus-visible:ring-2 focus-visible:ring-heizen-400"
                  title={`Download ${att.name}`}
                >
                  <Paperclip className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} aria-hidden />
                  <span className="max-w-[160px] truncate font-medium">{att.name}</span>
                  <span className="text-slate-400">{formatFileSize(att.size)}</span>
                  <Download
                    className="h-3.5 w-3.5 text-slate-400 group-hover:text-heizen-600"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

export function ConversationThread({ messages }: { messages: ConversationMessage[] }) {
  return (
    <ol className="flex flex-col gap-4">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </ol>
  );
}
