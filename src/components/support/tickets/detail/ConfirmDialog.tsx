"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Dialog } from "@/components/ui/Dialog";

interface ConfirmDialogProps {
  open: boolean;
  icon: LucideIcon;
  tone?: "primary" | "warning" | "danger";
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const TONE = {
  primary: {
    badge: "border-heizen-100 bg-heizen-50 text-heizen-700",
    confirm: "bg-heizen-500 hover:bg-heizen-600 focus-visible:ring-heizen-400",
  },
  warning: {
    badge: "border-amber-100 bg-amber-50 text-amber-600",
    confirm: "bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-400",
  },
  danger: {
    badge: "border-red-100 bg-red-50 text-red-600",
    confirm: "bg-red-600 hover:bg-red-700 focus-visible:ring-red-400",
  },
};

export function ConfirmDialog({
  open,
  icon: Icon,
  tone = "primary",
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const t = TONE[tone];
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      role="alertdialog"
      labelledBy="confirm-title"
      describedBy="confirm-desc"
      className="w-full max-w-sm rounded-lg border border-[#EAECEE] bg-white p-5 shadow-panel"
    >
      <div className="flex gap-3">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
            t.badge,
          )}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
        </span>
        <div>
          <h2 id="confirm-title" className="text-sm font-semibold text-slate-900">
            {title}
          </h2>
          <p id="confirm-desc" className="mt-1 text-sm text-slate-500">
            {message}
          </p>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-9 items-center rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={cn(
            "inline-flex h-9 items-center rounded-md px-3.5 text-sm font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            t.confirm,
          )}
        >
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
