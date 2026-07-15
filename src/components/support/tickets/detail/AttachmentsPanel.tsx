"use client";

import {
  Download,
  FileText,
  FileImage,
  FileSpreadsheet,
  File as FileIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TicketDetail } from "@/lib/types";
import { formatDisplayDate } from "@/lib/support/dateFormat";
import { formatFileSize } from "@/lib/support/fileSize";
import { downloadMockFile } from "@/lib/support/downloadMock";

interface AttachmentRow {
  id: string;
  name: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

function iconForFile(name: string): LucideIcon {
  const ext = name.slice(name.lastIndexOf(".") + 1).toLowerCase();
  if (["jpg", "jpeg", "png"].includes(ext)) return FileImage;
  if (ext === "xlsx") return FileSpreadsheet;
  if (["pdf", "docx"].includes(ext)) return FileText;
  return FileIcon;
}

export function AttachmentsPanel({ detail }: { detail: TicketDetail }) {
  const rows: AttachmentRow[] = detail.messages.flatMap((m) =>
    m.attachments.map((a) => ({
      id: a.id,
      name: a.name,
      size: a.size,
      uploadedBy: m.author === "employee" ? `${m.authorName} (You)` : m.authorName,
      uploadedAt: m.createdAt,
    })),
  );

  if (rows.length === 0) {
    return <p className="text-sm text-slate-400">No attachments on this ticket yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {rows.map((row) => {
        const Icon = iconForFile(row.name);
        return (
          <li
            key={row.id}
            className="flex items-center gap-3 rounded-md border border-[#EAECEE] bg-white px-3 py-2"
          >
            <Icon className="h-5 w-5 shrink-0 text-slate-400" strokeWidth={1.75} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-700" title={row.name}>
                {row.name}
              </p>
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
