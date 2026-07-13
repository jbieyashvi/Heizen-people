"use client";

import { useRef, useState } from "react";
import {
  UploadCloud,
  FileText,
  FileImage,
  FileSpreadsheet,
  File as FileIcon,
  X,
  CircleAlert,
  CircleCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { ALLOWED_FILE_TYPES_LABEL, FILE_ACCEPT_ATTR, MAX_FILE_SIZE_LABEL } from "@/lib/config/ticketForm";
import { formatFileSize } from "@/lib/support/fileSize";
import type { AttachmentFile } from "@/lib/types";

interface AttachmentUploadProps {
  files: AttachmentFile[];
  onAddFiles: (files: File[]) => void;
  onRemove: (id: string) => void;
}

function iconForFile(name: string): LucideIcon {
  const ext = name.slice(name.lastIndexOf(".") + 1).toLowerCase();
  if (["jpg", "jpeg", "png"].includes(ext)) return FileImage;
  if (ext === "xlsx") return FileSpreadsheet;
  if (["pdf", "docx"].includes(ext)) return FileText;
  return FileIcon;
}

export function AttachmentUpload({ files, onAddFiles, onRemove }: AttachmentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    onAddFiles(Array.from(list));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">
          Attachments <span className="text-xs font-normal text-slate-400">(optional)</span>
        </span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-4 py-7 text-center transition-colors",
          dragging ? "border-heizen-300 bg-heizen-50/50" : "border-[#D7DBDE] bg-surface-muted",
        )}
      >
        <UploadCloud className="h-6 w-6 text-slate-400" strokeWidth={1.5} aria-hidden />
        <p className="text-sm text-slate-600">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded font-medium text-heizen-700 outline-none hover:text-heizen-800 focus-visible:ring-2 focus-visible:ring-heizen-400"
          >
            Click to upload
          </button>{" "}
          or drag and drop
        </p>
        <p className="text-xs text-slate-400">
          {ALLOWED_FILE_TYPES_LABEL} · up to {MAX_FILE_SIZE_LABEL} each
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={FILE_ACCEPT_ATTR}
          onChange={(e) => {
            handleFiles(e.target.files);
            // Allow re-selecting the same file after removal.
            e.target.value = "";
          }}
          className="sr-only"
          aria-label="Upload attachments"
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((file) => {
            const Icon = iconForFile(file.name);
            const isError = file.status === "error";
            return (
              <li
                key={file.id}
                className={cn(
                  "flex items-center gap-3 rounded-md border px-3 py-2",
                  isError ? "border-red-200 bg-red-50/50" : "border-[#EAECEE] bg-white",
                )}
              >
                <Icon
                  className={cn("h-5 w-5 shrink-0", isError ? "text-red-500" : "text-slate-400")}
                  strokeWidth={1.75}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-700" title={file.name}>
                    {file.name}
                  </p>
                  {isError ? (
                    <p className="flex items-center gap-1 text-xs font-medium text-red-600">
                      <CircleAlert className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                      {file.error}
                    </p>
                  ) : (
                    <p className="flex items-center gap-1 text-xs text-slate-400">
                      <CircleCheck className="h-3.5 w-3.5 text-emerald-500" strokeWidth={1.75} aria-hidden />
                      {formatFileSize(file.size)} · Ready
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(file.id)}
                  aria-label={`Remove ${file.name}`}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 outline-none hover:bg-slate-50 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-heizen-400"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
