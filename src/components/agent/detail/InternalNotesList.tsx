import { Lock, Paperclip } from "lucide-react";
import type { ConversationMessage } from "@/lib/types";
import { formatDisplayDateTime } from "@/lib/support/dateFormat";
import { formatFileSize } from "@/lib/support/fileSize";

export function InternalNotesList({ notes }: { notes: ConversationMessage[] }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="inline-flex w-fit items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
        <Lock className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
        Only visible to the support team
      </p>

      {notes.length === 0 ? (
        <p className="text-sm text-slate-400">No internal notes yet.</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {notes.map((note) => (
            <li key={note.id} className="rounded-lg border border-amber-200 bg-amber-50/50 px-3.5 py-2.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="text-sm font-semibold text-slate-800">{note.authorName}</span>
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">
                  {note.authorMeta}
                </span>
                <span className="text-xs text-slate-400">{formatDisplayDateTime(note.createdAt)}</span>
              </div>
              <div
                className="prose-editor mt-1.5 text-sm leading-relaxed text-slate-700"
                dangerouslySetInnerHTML={{ __html: note.bodyHtml }}
              />
              {note.attachments.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {note.attachments.map((a) => (
                    <li
                      key={a.id}
                      className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-white px-2 py-1 text-xs text-slate-600"
                    >
                      <Paperclip className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} aria-hidden />
                      <span className="max-w-[160px] truncate font-medium">{a.name}</span>
                      <span className="text-slate-400">{formatFileSize(a.size)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
