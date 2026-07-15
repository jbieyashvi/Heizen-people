"use client";

import { TriangleAlert } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";

interface Props {
  open: boolean;
  title: string;
  message: string;
  impact: { label: string; value: string | number }[];
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ImpactConfirmDialog({ open, title, message, impact, confirmLabel, onCancel, onConfirm }: Props) {
  if (!open) return null;
  return (
    <Dialog open={open} onClose={onCancel} role="alertdialog" labelledBy="impact-title" describedBy="impact-desc" className="w-full max-w-sm rounded-lg border border-[#EAECEE] bg-white p-5 shadow-panel">
      <div className="flex gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-100 bg-amber-50 text-amber-600"><TriangleAlert className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden /></span>
        <div>
          <h2 id="impact-title" className="text-sm font-semibold text-slate-900">{title}</h2>
          <p id="impact-desc" className="mt-1 text-sm text-slate-500">{message}</p>
        </div>
      </div>
      {impact.length > 0 && (
        <dl className="mt-3 rounded-md border border-[#EAECEE] bg-surface-muted px-3 py-2 text-xs">
          {impact.map((i) => (<div key={i.label} className="flex justify-between py-0.5"><dt className="text-slate-400">{i.label}</dt><dd className="font-medium text-slate-700">{i.value}</dd></div>))}
        </dl>
      )}
      <div className="mt-5 flex justify-end gap-2.5">
        <button type="button" onClick={onCancel} className="inline-flex h-9 items-center rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400">Cancel</button>
        <button type="button" onClick={onConfirm} className="inline-flex h-9 items-center rounded-md bg-amber-500 px-3.5 text-sm font-medium text-white outline-none hover:bg-amber-600 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2">{confirmLabel}</button>
      </div>
    </Dialog>
  );
}
