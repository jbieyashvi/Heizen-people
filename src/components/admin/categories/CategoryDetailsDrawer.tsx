"use client";

import { Pencil, Plus, Eye, Power, ArrowUp, ArrowDown, Info } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Category, RequestType } from "@/lib/admin/categoryTypes";
import { resolveRouting } from "@/lib/admin/categorySelectors";
import { getCategoryIcon } from "@/lib/admin/categoryIcons";
import { getActivityForEntity } from "@/lib/admin/adminActivity";
import { formatDisplayDate, formatDisplayDateTime } from "@/lib/support/dateFormat";
import { Drawer } from "@/components/ui/Drawer";
import { StatusTag } from "@/components/admin/config/ui";

interface Props {
  open: boolean;
  category: Category | null;
  activeTickets: number;
  onClose: () => void;
  onEdit: (c: Category) => void;
  onPreview: (c: Category) => void;
  onToggleStatus: (c: Category) => void;
  onAddRequestType: (c: Category) => void;
  onEditRequestType: (c: Category, rt: RequestType) => void;
  onMoveRequestType: (rtId: string, dir: "up" | "down") => void;
  onToggleRequestType: (rt: RequestType) => void;
}

function VisTag({ visibility }: { visibility: Category["visibility"] }) {
  return <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", visibility === "Visible" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>{visibility}</span>;
}

export function CategoryDetailsDrawer({ open, category, activeTickets, onClose, onEdit, onPreview, onToggleStatus, onAddRequestType, onEditRequestType, onMoveRequestType, onToggleRequestType }: Props) {
  if (!open || !category) return null;

  const Icon = getCategoryIcon(category.icon);
  const routing = resolveRouting(category);
  const sortedRts = [...category.requestTypes].sort((a, b) => a.order - b.order);
  const activity = getActivityForEntity(category.name).slice(0, 6);

  return (
    <Drawer open={open} onClose={onClose} title={category.name} description="Category & request types" widthClass="max-w-xl"
      footer={
        <>
          <button type="button" onClick={() => onPreview(category)} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-3 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400"><Eye className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden /> Preview Form</button>
          <button type="button" onClick={() => onToggleStatus(category)} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-3 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400"><Power className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden /> {category.status === "Active" ? "Deactivate" : "Activate"}</button>
          <button type="button" onClick={() => onEdit(category)} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-heizen-500 px-3 text-sm font-medium text-white outline-none hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-2"><Pencil className="h-4 w-4" strokeWidth={2} aria-hidden /> Edit</button>
        </>
      }>
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#EAECEE] bg-surface-muted text-heizen-600"><Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden /></span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2"><StatusTag status={category.status} /><VisTag visibility={category.visibility} /></div>
            <p className="mt-1 text-sm text-slate-600">{category.description}</p>
          </div>
        </div>

        {category.prototypeNote && (
          <p className="flex items-start gap-1.5 rounded-md border border-dashed border-amber-200 bg-amber-50/50 px-2.5 py-1.5 text-[11px] text-amber-700"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden /> Prototype options — pending HR confirmation. (Not shown to employees.)</p>
        )}

        <dl className="divide-y divide-[#EAECEE] rounded-lg border border-[#EAECEE]">
          <Row label="Responsible Department">{routing.departmentName ?? <span className="text-red-600">Missing</span>}</Row>
          <Row label="Default Support Team">{routing.teamName ?? <span className="text-red-600">Missing</span>}</Row>
          <Row label="Active tickets">{activeTickets}</Row>
          <Row label="Display order">{category.order}</Row>
          <Row label="Created">{formatDisplayDate(category.createdAt)}</Row>
          <Row label="Updated">{formatDisplayDate(category.updatedAt)}</Row>
        </dl>

        {!routing.configured && (
          <p className="rounded-md border border-red-200 bg-red-50/60 px-3 py-2 text-xs font-medium text-red-700">Routing is missing. Employees can&rsquo;t use this category until a department and team are set.</p>
        )}

        {/* Request types */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Request types ({sortedRts.length})</h3>
            <button type="button" onClick={() => onAddRequestType(category)} className="inline-flex h-7 items-center gap-1 rounded-md border border-[#EAECEE] bg-white px-2 text-xs font-medium text-heizen-700 outline-none hover:bg-heizen-50 focus-visible:ring-2 focus-visible:ring-heizen-400"><Plus className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden /> Add</button>
          </div>
          {sortedRts.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[#DDE1E4] px-4 py-5 text-center text-sm text-slate-500">This category has no request types yet.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {sortedRts.map((rt, i) => (
                <li key={rt.id} className="flex items-center gap-2 rounded-md border border-[#EAECEE] px-2.5 py-2">
                  <div className="flex flex-col">
                    <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => onMoveRequestType(rt.id, "up")} className="flex h-4 w-5 items-center justify-center rounded text-slate-400 outline-none hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-heizen-400 disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" strokeWidth={2} aria-hidden /></button>
                    <button type="button" aria-label="Move down" disabled={i === sortedRts.length - 1} onClick={() => onMoveRequestType(rt.id, "down")} className="flex h-4 w-5 items-center justify-center rounded text-slate-400 outline-none hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-heizen-400 disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" strokeWidth={2} aria-hidden /></button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-medium text-slate-700">{rt.name}</span>
                      <StatusTag status={rt.status} />
                      <VisTag visibility={rt.visibility} />
                      {rt.defaultPriority !== "None" && <span className="rounded bg-heizen-50 px-1 text-[10px] font-semibold text-heizen-700">{rt.defaultPriority}</span>}
                    </div>
                    {rt.helperText && <p className="text-[11px] text-slate-400">{rt.helperText}</p>}
                  </div>
                  <button type="button" onClick={() => onEditRequestType(category, rt)} className="inline-flex h-7 items-center rounded-md border border-[#EAECEE] px-2 text-xs font-medium text-slate-600 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400">Edit</button>
                  <button type="button" onClick={() => onToggleRequestType(rt)} className="inline-flex h-7 items-center rounded-md border border-[#EAECEE] px-2 text-xs font-medium text-slate-600 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400">{rt.status === "Active" ? "Deactivate" : "Activate"}</button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Recent configuration activity</h3>
          {activity.length === 0 ? <p className="text-sm text-slate-400">No recent activity.</p> : (
            <ul className="flex flex-col gap-1.5">{activity.map((e) => (<li key={e.id} className="text-xs text-slate-500"><span className="font-medium text-slate-700">{e.action}</span> · {e.admin} · {formatDisplayDateTime(e.at)}</li>))}</ul>
          )}
        </section>
      </div>
    </Drawer>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-3 px-3 py-2"><dt className="text-xs font-medium text-slate-400">{label}</dt><dd className="text-right text-sm font-medium text-slate-700">{children}</dd></div>;
}
