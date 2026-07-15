"use client";

import { useCallback, useState } from "react";
import type { AttachmentFile, MessageAttachment } from "@/lib/types";
import { validateAttachment } from "@/lib/support/attachmentValidation";

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `f-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
}

/** Manage a list of client-validated attachments for a composer. */
export function useAttachments() {
  const [files, setFiles] = useState<AttachmentFile[]>([]);

  const addFiles = useCallback((incoming: File[]) => {
    const mapped: AttachmentFile[] = incoming.map((file) => {
      const result = validateAttachment(file.name, file.size);
      return { id: newId(), name: file.name, size: file.size, ...result };
    });
    setFiles((prev) => [...prev, ...mapped]);
  }, []);

  const remove = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const reset = useCallback(() => setFiles([]), []);

  const valid = files.filter((f) => f.status === "success");
  const hasErrors = files.some((f) => f.status === "error");

  /** Valid attachments mapped to the persisted message-attachment shape. */
  const toMessageAttachments = useCallback(
    (): MessageAttachment[] =>
      files
        .filter((f) => f.status === "success")
        .map((f) => ({ id: newId(), name: f.name, size: f.size })),
    [files],
  );

  return { files, addFiles, remove, reset, valid, hasErrors, toMessageAttachments };
}
