import {
  ALLOWED_FILE_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_LABEL,
  ALLOWED_FILE_TYPES_LABEL,
} from "@/lib/config/ticketForm";
import type { AttachmentFile } from "@/lib/types";

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
}

/** Validate a single file against type & size rules. Pure — no DOM. */
export function validateAttachment(name: string, size: number): {
  status: AttachmentFile["status"];
  error?: string;
} {
  const ext = extensionOf(name);
  if (!ALLOWED_FILE_EXTENSIONS.includes(ext as (typeof ALLOWED_FILE_EXTENSIONS)[number])) {
    return { status: "error", error: `Unsupported file type. Allowed: ${ALLOWED_FILE_TYPES_LABEL}.` };
  }
  if (size > MAX_FILE_SIZE_BYTES) {
    return { status: "error", error: `File exceeds the ${MAX_FILE_SIZE_LABEL} limit.` };
  }
  return { status: "success" };
}
