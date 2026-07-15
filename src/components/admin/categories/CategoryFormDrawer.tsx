"use client";

import { useEffect, useMemo, useState } from "react";
import { TriangleAlert } from "lucide-react";
import type { Category } from "@/lib/admin/categoryTypes";
import type { OrgConfig } from "@/lib/admin/orgTypes";
import { Drawer } from "@/components/ui/Drawer";
import { getCategoryIcon, ICON_OPTIONS } from "@/lib/admin/categoryIcons";
import { Field, inputClass } from "@/components/admin/config/ui";

interface Props {
  open: boolean;
  mode: "add" | "edit";
  category?: Category;
  categories: Category[];
  org: OrgConfig;
  activeTicketCount: number;
  onClose: () => void;
  onSubmit: (values: Omit<Category, "id" | "requestTypes" | "createdAt" | "updatedAt" | "order"> & { order?: number }) => void;
}

interface FormValues {
  name: string;
  description: string;
  icon: string;
  departmentId: string;
  teamId: string;
  order: number;
  status: Category["status"];
  visibility: Category["visibility"];
}

const EMPTY: FormValues = { name: "", description: "", icon: "users", departmentId: "", teamId: "", order: 1, status: "Active", visibility: "Visible" };

export function CategoryFormDrawer({ open, mode, category, categories, org, activeTicketCount, onClose, onSubmit }: Props) {
  const [v, setV] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [routingConfirmed, setRoutingConfirmed] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && category) {
      setV({ name: category.name, description: category.description, icon: category.icon, departmentId: category.departmentId, teamId: category.teamId, order: category.order, status: category.status, visibility: category.visibility });
    } else {
      const nextOrder = Math.max(0, ...categories.map((c) => c.order)) + 1;
      setV({ ...EMPTY, order: nextOrder });
    }
    setErrors({});
    setRoutingConfirmed(false);
  }, [open, mode, category, categories]);

  const activeDepts = useMemo(() => org.departments.filter((d) => d.status === "Active" || d.id === category?.departmentId), [org.departments, category]);
  const teamOptions = useMemo(() => org.teams.filter((t) => t.departmentId === v.departmentId && (t.status === "Active" || t.id === category?.teamId)), [org.teams, v.departmentId, category]);

  if (!open) return null;
  const set = (patch: Partial<FormValues>) => setV((s) => ({ ...s, ...patch }));

  const routingChanged = mode === "edit" && category && (v.departmentId !== category.departmentId || v.teamId !== category.teamId);
  const needsRoutingConfirm = !!routingChanged && activeTicketCount > 0;

  function validate(): boolean {
    const e: Partial<Record<keyof FormValues, string>> = {};
    const others = categories.filter((c) => c.id !== category?.id);
    if (!v.name.trim()) e.name = "Category name is required.";
    else if (others.some((c) => c.name.trim().toLowerCase() === v.name.trim().toLowerCase())) e.name = "A category with this name already exists.";
    if (!v.description.trim()) e.description = "Description is required.";
    if (!v.departmentId) e.departmentId = "Responsible department is required.";
    if (!v.teamId) e.teamId = "Default support team is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit() {
    if (!validate()) return;
    if (needsRoutingConfirm && !routingConfirmed) return;
    onSubmit({ name: v.name.trim(), description: v.description.trim(), icon: v.icon, departmentId: v.departmentId, teamId: v.teamId, status: v.status, visibility: v.visibility, order: v.order });
  }

  const PreviewIcon = getCategoryIcon(v.icon);
  const previewTeam = org.teams.find((t) => t.id === v.teamId);

  return (
    <Drawer open={open} onClose={onClose} title={mode === "add" ? "Add Category" : "Edit Category"} description={mode === "add" ? "Configure a support category." : category?.name} widthClass="max-w-lg"
      footer={
        <>
          <button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400">Cancel</button>
          <button type="button" onClick={submit} className="inline-flex h-9 items-center rounded-md bg-heizen-500 px-3.5 text-sm font-medium text-white outline-none hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-2">{mode === "add" ? "Create Category" : "Save Changes"}</button>
        </>
      }>
      <div className="flex flex-col gap-3.5">
        {/* Live employee-facing preview */}
        <div className="flex items-start gap-3 rounded-lg border border-heizen-100 bg-heizen-50/40 p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-heizen-200 bg-white text-heizen-600"><PreviewIcon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden /></span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800">{v.name || "Category name"}</p>
            <p className="text-xs text-slate-500">{v.description || "Employee-facing description"}</p>
            <p className="mt-1 text-[11px] text-slate-400">Routes to: {previewTeam ? previewTeam.name : "—"}</p>
          </div>
        </div>

        <Field label="Category Name" htmlFor="c-name" required error={errors.name}><input id="c-name" value={v.name} onChange={(e) => set({ name: e.target.value })} className={inputClass} /></Field>
        <Field label="Employee Description" htmlFor="c-desc" required error={errors.description}><textarea id="c-desc" rows={2} value={v.description} onChange={(e) => set({ description: e.target.value })} className="w-full resize-none rounded-md border border-[#EAECEE] bg-white px-2.5 py-2 text-sm text-slate-700 outline-none focus:border-heizen-300 focus:ring-2 focus:ring-heizen-100" /></Field>
        <Field label="Icon" htmlFor="c-icon"><select id="c-icon" value={v.icon} onChange={(e) => set({ icon: e.target.value })} className={inputClass}>{ICON_OPTIONS.map((o) => (<option key={o.key} value={o.key}>{o.label}</option>))}</select></Field>
        <Field label="Responsible Department" htmlFor="c-dept" required error={errors.departmentId}>
          <select id="c-dept" value={v.departmentId} onChange={(e) => set({ departmentId: e.target.value, teamId: "" })} className={inputClass}>
            <option value="">Select a department…</option>
            {activeDepts.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
          </select>
        </Field>
        <Field label="Default Support Team" htmlFor="c-team" required error={errors.teamId} hint={!v.departmentId ? "Select a department first." : undefined}>
          <select id="c-team" value={v.teamId} disabled={!v.departmentId} onChange={(e) => set({ teamId: e.target.value })} className={inputClass}>
            <option value="">{v.departmentId ? "Select a team…" : "—"}</option>
            {teamOptions.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
          </select>
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Display Order" htmlFor="c-order"><input id="c-order" type="number" min={1} value={v.order} onChange={(e) => set({ order: Math.max(1, Number(e.target.value) || 1) })} className={inputClass} /></Field>
          <Field label="Visibility" htmlFor="c-vis"><select id="c-vis" value={v.visibility} onChange={(e) => set({ visibility: e.target.value as Category["visibility"] })} className={inputClass}><option>Visible</option><option>Hidden</option></select></Field>
          <Field label="Status" htmlFor="c-status"><select id="c-status" value={v.status} onChange={(e) => set({ status: e.target.value as Category["status"] })} className={inputClass}><option>Active</option><option>Inactive</option></select></Field>
        </div>

        {needsRoutingConfirm && (
          <label className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-800">
            <input type="checkbox" checked={routingConfirmed} onChange={(e) => setRoutingConfirmed(e.target.checked)} className="mt-0.5" />
            <span><TriangleAlert className="mr-1 inline h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />Routing changed. The {activeTicketCount} existing ticket(s) keep their current team — only new tickets use the updated routing. Confirm to proceed.</span>
          </label>
        )}
      </div>
    </Drawer>
  );
}
