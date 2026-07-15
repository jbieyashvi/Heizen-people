"use client";

import { useEffect, useState } from "react";
import type { Category, DefaultPriority, RequestType } from "@/lib/admin/categoryTypes";
import { Dialog } from "@/components/ui/Dialog";
import { Field, inputClass } from "@/components/admin/config/ui";

interface Props {
  open: boolean;
  mode: "add" | "edit";
  category: Category;
  requestType?: RequestType;
  onClose: () => void;
  onSubmit: (values: Omit<RequestType, "id" | "createdAt" | "updatedAt" | "order"> & { order?: number }) => void;
}

interface FormValues {
  name: string;
  helperText: string;
  defaultPriority: DefaultPriority;
  order: number;
  visibility: RequestType["visibility"];
  status: RequestType["status"];
}

const EMPTY: FormValues = { name: "", helperText: "", defaultPriority: "None", order: 1, visibility: "Visible", status: "Active" };

export function RequestTypeFormModal({ open, mode, category, requestType, onClose, onSubmit }: Props) {
  const [v, setV] = useState<FormValues>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && requestType) setV({ name: requestType.name, helperText: requestType.helperText, defaultPriority: requestType.defaultPriority, order: requestType.order, visibility: requestType.visibility, status: requestType.status });
    else setV({ ...EMPTY, order: Math.max(0, ...category.requestTypes.map((r) => r.order)) + 1 });
    setError(null);
  }, [open, mode, requestType, category]);

  if (!open) return null;
  const set = (patch: Partial<FormValues>) => setV((s) => ({ ...s, ...patch }));

  function submit() {
    const name = v.name.trim();
    if (!name) { setError("Request type name is required."); return; }
    const dup = category.requestTypes.some((r) => r.id !== requestType?.id && r.name.trim().toLowerCase() === name.toLowerCase());
    if (dup) { setError("This request type already exists in this category."); return; }
    onSubmit({ name, helperText: v.helperText.trim(), defaultPriority: v.defaultPriority, visibility: v.visibility, status: v.status, order: v.order });
  }

  return (
    <Dialog open={open} onClose={onClose} labelledBy="rt-title">
      <h2 id="rt-title" className="text-sm font-semibold text-slate-900">{mode === "add" ? "Add Request Type" : "Edit Request Type"}</h2>
      <p className="mt-0.5 text-xs text-slate-500">In {category.name}</p>

      <div className="mt-3 flex flex-col gap-3">
        <Field label="Request Type Name" htmlFor="rt-name" required error={error ?? undefined}><input id="rt-name" value={v.name} onChange={(e) => { set({ name: e.target.value }); setError(null); }} className={inputClass} /></Field>
        <Field label="Employee Helper Text" htmlFor="rt-help"><input id="rt-help" value={v.helperText} onChange={(e) => set({ helperText: e.target.value })} placeholder="Optional guidance shown to employees" className={inputClass} /></Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Default Priority" htmlFor="rt-prio"><select id="rt-prio" value={v.defaultPriority} onChange={(e) => set({ defaultPriority: e.target.value as DefaultPriority })} className={inputClass}><option>None</option><option>Low</option><option>Medium</option><option>High</option></select></Field>
          <Field label="Display Order" htmlFor="rt-order"><input id="rt-order" type="number" min={1} value={v.order} onChange={(e) => set({ order: Math.max(1, Number(e.target.value) || 1) })} className={inputClass} /></Field>
          <Field label="Visibility" htmlFor="rt-vis"><select id="rt-vis" value={v.visibility} onChange={(e) => set({ visibility: e.target.value as RequestType["visibility"] })} className={inputClass}><option>Visible</option><option>Hidden</option></select></Field>
        </div>
        <Field label="Status" htmlFor="rt-status"><select id="rt-status" value={v.status} onChange={(e) => set({ status: e.target.value as RequestType["status"] })} className={inputClass}><option>Active</option><option>Inactive</option></select></Field>
      </div>

      <div className="mt-4 flex justify-end gap-2.5">
        <button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400">Cancel</button>
        <button type="button" onClick={submit} className="inline-flex h-9 items-center rounded-md bg-heizen-500 px-3.5 text-sm font-medium text-white outline-none hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-2">{mode === "add" ? "Add Request Type" : "Save Changes"}</button>
      </div>
    </Dialog>
  );
}
