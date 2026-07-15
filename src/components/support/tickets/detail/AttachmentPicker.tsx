"use client";

import { useRef } from "react";
import {
  Paperclip,
  FileText,
  FileImage,
  FileSpreadsheet,
  File as FileIcon,
  X,
  CircleAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { ALLOWED_FILE_TYPES_LABEL, FILE_ACCEPT_ATTR, MAX_FILE_SIZE_LABEL } from "@/lib/config/ticketForm";
import { formatFileSize } from "@/lib/support/fileSize";
import type { AttachmentFile } from "@/lib/types";

interface AttachmentPickerProps {
  files: AttachmentFile[];
  onAddFiles: (files: File[]) => void;
  onRemove: (id: string) => void;
  label?: string;
}

function iconForFile(name: string): LucideIcon {
  const ext = name.slice(name.lastIndexOf(".") + 1).toLowerCase();
  if (["jpg", "jpeg", "png"].includes(ext)) return FileImage;
  if (ext === "xlsx") return FileSpreadsheet;
  if (["pdf", "docx"].includes(ext)) return FileText;
  return FileIcon;
}

/** Compact attach-files control with an inline validated file list. */
export function AttachmentPicker({ files, onAddFiles, onRemove, label = "Attach files" }: AttachmentPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-2">
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-2.5 text-xs font-medium text-slate-600 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400"
        >
          <Paperclip className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden />
          {label}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={FILE_ACCEPT_ATTR}
          onChange={(e) => {
            if (e.target.files) onAddFiles(Array.from(e.target.files));
            e.target.value = "";
          }}
          className="sr-only"
          aria-label={label}
        />
        <span className="ml-2 text-xs text-slate-400">
          {ALLOWED_FILE_TYPES_LABEL} · up to {MAX_FILE_SIZE_LABEL}
        </span>
      </div>

      {files.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {files.map((file) => {
            const Icon = iconForFile(file.name);
            const isError = file.status === "error";
            return (
              <li
                key={file.id}
                className={cn(
                  "flex items-center gap-2.5 rounded-md border px-2.5 py-1.5",
                  isError ? "border-red-200 bg-red-50/50" : "border-[#EAECEE] bg-white",
                )}
              >
                <Icon
                  className={cn("h-4 w-4 shrink-0", isError ? "text-red-500" : "text-slate-400")}
                  strokeWidth={1.75}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-700" title={file.name}>
                    {file.name}
                  </p>
                  {isError ? (
                    <p className="flex items-center gap-1 text-[11px] font-medium text-red-600">
                      <CircleAlert className="h-3 w-3" strokeWidth={1.75} aria-hidden />
                      {file.error}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400">{formatFileSize(file.size)}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(file.id)}
                  aria-label={`Remove ${file.name}`}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-400 outline-none hover:bg-slate-50 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-heizen-400"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
