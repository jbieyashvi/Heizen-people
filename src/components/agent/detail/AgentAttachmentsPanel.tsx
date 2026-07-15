"use client";

import { Download, FileText, FileImage, FileSpreadsheet, File as FileIcon, Lock, Eye } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TicketDetail } from "@/lib/types";
import { formatDisplayDate } from "@/lib/support/dateFormat";
import { formatFileSize } from "@/lib/support/fileSize";
import { downloadMockFile } from "@/lib/support/downloadMock";

interface Row {
  id: string;
  name: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  internal: boolean;
}

function iconForFile(name: string): LucideIcon {
  const ext = name.slice(name.lastIndexOf(".") + 1).toLowerCase();
  if (["jpg", "jpeg", "png"].includes(ext)) return FileImage;
  if (ext === "xlsx") return FileSpreadsheet;
  if (["pdf", "docx"].includes(ext)) return FileText;
  return FileIcon;
}

/** Agent attachments view — shows every file with its visibility. */
export function AgentAttachmentsPanel({ detail }: { detail: TicketDetail }) {
  const rows: Row[] = detail.messages.flatMap((m) =>
    m.attachments.map((a) => ({
      id: a.id,
      name: a.name,
      size: a.size,
      uploadedBy: m.author === "employee" ? m.authorName : m.authorName,
      uploadedAt: m.createdAt,
      internal: (a.visibility ?? m.visibility) === "internal",
    })),
  );

  if (rows.length === 0) {
    return <p className="text-sm text-slate-400">No attachments on this ticket.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {rows.map((row) => {
        const Icon = iconForFile(row.name);
        return (
          <li key={row.id} className="flex items-center gap-3 rounded-md border border-[#EAECEE] bg-white px-3 py-2">
            <Icon className="h-5 w-5 shrink-0 text-slate-400" strokeWidth={1.75} aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-slate-700" title={row.name}>{row.name}</p>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold",
                    row.internal ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700",
                  )}
                >
                  {row.internal ? <Lock className="h-2.5 w-2.5" strokeWidth={2} aria-hidden /> : <Eye className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />}
                  {row.internal ? "Internal" : "Employee-visible"}
                </span>
              </div>
              <p className="truncate text-xs text-slate-400">
                {formatFileSize(row.size)} · {row.uploadedBy} · {formatDisplayDate(row.uploadedAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => downloadMockFile(row.name)}
              aria-label={`Download ${row.name}`}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-2.5 text-xs font-medium text-heizen-700 outline-none transition-colors hover:border-heizen-200 hover:bg-heizen-50 focus-visible:ring-2 focus-visible:ring-heizen-400"
            >
              <Download className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              Download
            </button>
          </li>
        );
      })}
    </ul>
  );
}
