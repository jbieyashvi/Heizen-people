"use client";

import { useEffect, useMemo, useState } from "react";
import { Users, Eye } from "lucide-react";
import type { Category, RequestType } from "@/lib/admin/categoryTypes";
import { getEmployeeCategories, resolveRouting, visibleRequestTypes } from "@/lib/admin/categorySelectors";
import { Drawer } from "@/components/ui/Drawer";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { CategoryPicker } from "@/components/support/new/CategoryPicker";
import { RequestTypeSelect } from "@/components/support/new/RequestTypeSelect";

interface Props {
  open: boolean;
  initialCategoryId?: string;
  onClose: () => void;
}

/** Non-editable preview of the Employee Raise New Ticket form (real config + components). */
export function EmployeeFormPreviewDrawer({ open, initialCategoryId, onClose }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [catId, setCatId] = useState<string | null>(null);
  const [rt, setRt] = useState<RequestType | null>(null);

  useEffect(() => {
    if (!open) return;
    const list = getEmployeeCategories();
    setCategories(list);
    const start = initialCategoryId && list.some((c) => c.id === initialCategoryId) ? initialCategoryId : list[0]?.id ?? null;
    setCatId(start);
    setRt(null);
  }, [open, initialCategoryId]);

  const category = categories.find((c) => c.id === catId) ?? null;
  const options = useMemo(() => (category ? visibleRequestTypes(category) : []), [category]);
  const routing = category ? resolveRouting(category) : null;
  const previewPriority = rt && rt.defaultPriority !== "None" ? rt.defaultPriority : "Medium";

  if (!open) return null;

  return (
    <Drawer open={open} onClose={onClose} title="Employee Form Preview" description="Exactly what employees see when raising a ticket." widthClass="max-w-xl"
      footer={<button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-md bg-heizen-500 px-3.5 text-sm font-medium text-white outline-none hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-2">Close Preview</button>}>
      <div className="mb-3 inline-flex items-center gap-1.5 rounded-md border border-[#EAECEE] bg-surface-muted px-2 py-1 text-xs text-slate-500"><Eye className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden /> Preview — not submittable. Switch categories to verify dynamic behaviour.</div>

      {categories.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#DDE1E4] px-4 py-8 text-center text-sm text-slate-500">No employee-visible categories to preview.</p>
      ) : (
        <div className="flex flex-col gap-5">
          <CategoryPicker fieldId="pv-category" categories={categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon }))} value={catId} onChange={(id) => { setCatId(id); setRt(null); }} />
          <RequestTypeSelect fieldId="pv-rt" options={options} categorySelected={!!category} value={rt?.name ?? null} onChange={setRt} />

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">Subject</span>
            <div className="h-10 rounded-md border border-[#EAECEE] bg-surface-muted px-3 text-sm leading-10 text-slate-400">Brief summary of the request</div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">Description</span>
            <div className="h-20 rounded-md border border-[#EAECEE] bg-surface-muted px-3 py-2 text-sm text-slate-400">Describe your request in detail…</div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">Attachments</span>
            <div className="rounded-md border border-dashed border-[#D7DBDE] bg-surface-muted px-3 py-4 text-center text-xs text-slate-400">PDF, DOCX, JPG, PNG, XLSX · up to 10 MB</div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#EAECEE] bg-white p-3">
            <span className="flex items-center gap-2 text-sm text-slate-600">Priority <PriorityBadge priority={previewPriority as "Low" | "Medium" | "High"} /></span>
            <span className="inline-flex items-center gap-1.5 text-sm text-slate-600"><Users className="h-3.5 w-3.5 text-heizen-600" strokeWidth={1.75} aria-hidden /> Routes to: <span className="font-medium text-slate-700">{routing?.teamName ?? "—"}</span></span>
          </div>
        </div>
      )}
    </Drawer>
  );
}
