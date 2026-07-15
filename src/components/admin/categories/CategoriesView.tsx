"use client";

import { useMemo, useState } from "react";
import { Plus, Tags, X } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Panel } from "@/components/agent/Panel";
import { ErrorPanel, InlineEmpty } from "@/components/agent/AgentStates";
import { Toast } from "@/components/support/tickets/detail/Toast";
import type { TicketStatus } from "@/lib/types";
import type { Category, RequestType } from "@/lib/admin/categoryTypes";
import { useCategoryConfig } from "@/lib/admin/useCategoryConfig";
import { getOrgConfig } from "@/lib/admin/orgStore";
import { resolveRouting } from "@/lib/admin/categorySelectors";
import { SummaryTiles, inputClass } from "@/components/admin/config/ui";
import { CategoryTable } from "@/components/admin/categories/CategoryTable";
import { CategoryFormDrawer } from "@/components/admin/categories/CategoryFormDrawer";
import { CategoryDetailsDrawer } from "@/components/admin/categories/CategoryDetailsDrawer";
import { RequestTypeFormModal } from "@/components/admin/categories/RequestTypeFormModal";
import { ImpactConfirmDialog } from "@/components/admin/categories/ImpactConfirmDialog";
import { EmployeeFormPreviewDrawer } from "@/components/admin/categories/EmployeeFormPreviewDrawer";

const ACTIVE: TicketStatus[] = ["Open", "Assigned", "In Progress", "Waiting for Employee"];

export function CategoriesView() {
  const cc = useCategoryConfig();
  const { config, tickets, state } = cc;
  const org = getOrgConfig();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [dept, setDept] = useState("all");
  const [visibility, setVisibility] = useState("all");
  const [routing, setRouting] = useState("all");

  const [form, setForm] = useState<{ open: boolean; mode: "add" | "edit"; catId?: string }>({ open: false, mode: "add" });
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [rtModal, setRtModal] = useState<{ open: boolean; mode: "add" | "edit"; catId: string; rtId?: string } | null>(null);
  const [deactivateCatId, setDeactivateCatId] = useState<string | null>(null);
  const [deactivateRt, setDeactivateRt] = useState<{ catId: string; rtId: string } | null>(null);
  const [preview, setPreview] = useState<{ open: boolean; catId?: string }>({ open: false });
  const [toast, setToast] = useState<string | null>(null);

  const sorted = useMemo(() => [...config.categories].sort((a, b) => a.order - b.order), [config.categories]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return sorted.filter((c) => {
      if (query) {
        const rtMatch = c.requestTypes.some((r) => r.name.toLowerCase().includes(query));
        if (!c.name.toLowerCase().includes(query) && !rtMatch) return false;
      }
      if (status !== "all" && c.status !== status) return false;
      if (dept !== "all" && c.departmentId !== dept) return false;
      if (visibility !== "all" && c.visibility !== visibility) return false;
      if (routing !== "all") {
        const configured = resolveRouting(c).configured;
        if (routing === "Configured" && !configured) return false;
        if (routing === "Missing" && configured) return false;
      }
      return true;
    });
  }, [sorted, q, status, dept, visibility, routing]);

  if (state === "loading") return <div className="h-96 animate-pulse rounded-lg bg-slate-100" />;
  if (state === "error") return <ErrorPanel onRetry={cc.reload} />;

  const anyFilter = q.trim() !== "" || status !== "all" || dept !== "all" || visibility !== "all" || routing !== "all";
  const activeFor = (name: string) => tickets.filter((t) => t.category === name && ACTIVE.includes(t.status)).length;
  const historicalFor = (name: string) => tickets.filter((t) => t.category === name).length;

  const detailsCat = config.categories.find((c) => c.id === detailsId) ?? null;
  const formCat = config.categories.find((c) => c.id === form.catId);
  const rtModalCat = rtModal ? config.categories.find((c) => c.id === rtModal.catId) : undefined;
  const rtModalRt = rtModal?.rtId && rtModalCat ? rtModalCat.requestTypes.find((r) => r.id === rtModal.rtId) : undefined;
  const deactivateCat = config.categories.find((c) => c.id === deactivateCatId) ?? null;
  const deactivateRtCat = deactivateRt ? config.categories.find((c) => c.id === deactivateRt.catId) : undefined;
  const deactivateRtObj = deactivateRt && deactivateRtCat ? deactivateRtCat.requestTypes.find((r) => r.id === deactivateRt.rtId) : undefined;

  const summary = [
    { label: "Total Categories", value: config.categories.length },
    { label: "Active Categories", value: config.categories.filter((c) => c.status === "Active").length },
    { label: "Total Request Types", value: config.categories.reduce((n, c) => n + c.requestTypes.length, 0) },
    { label: "Categories Missing Routing", value: config.categories.filter((c) => !resolveRouting(c).configured).length, tone: "amber" as const },
  ];

  function toggleCategory(c: Category) {
    if (c.status === "Active") { setDeactivateCatId(c.id); return; }
    // Reactivation — validate routing is still valid.
    const r = resolveRouting(c);
    if (!r.configured || !r.departmentActive || !r.teamActive) {
      setToast("Set a valid active department and team before activating.");
      setForm({ open: true, mode: "edit", catId: c.id });
      return;
    }
    cc.setCategoryStatus(c.id, "Active");
    setToast(`${c.name} activated.`);
  }

  function toggleRequestType(cat: Category, rt: RequestType) {
    if (rt.status === "Active") { setDeactivateRt({ catId: cat.id, rtId: rt.id }); return; }
    cc.setRequestTypeStatus(cat.id, rt.id, "Active");
    setToast(`${rt.name} activated.`);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <Breadcrumb items={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Categories & Request Types" }]} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Categories &amp; Request Types</h2>
            <p className="mt-0.5 text-sm text-slate-500">Configure the support options employees see when raising a ticket.</p>
          </div>
          <button type="button" onClick={() => setForm({ open: true, mode: "add" })} className="inline-flex h-9 w-fit items-center gap-1.5 rounded-md bg-heizen-500 px-3.5 text-sm font-medium text-white outline-none hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-2"><Plus className="h-4 w-4" strokeWidth={2} aria-hidden /> Add Category</button>
        </div>
      </div>

      <SummaryTiles items={summary} />

      <div className="flex flex-wrap items-end gap-2.5 rounded-lg border border-[#EAECEE] bg-white p-3">
        <div className="min-w-[180px] flex-1"><label htmlFor="ct-q" className="mb-1 block text-xs font-medium text-slate-500">Search</label><input id="ct-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Category or request type…" className={inputClass} /></div>
        <div><label htmlFor="ct-status" className="mb-1 block text-xs font-medium text-slate-500">Status</label><select id="ct-status" value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}><option value="all">All</option><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
        <div><label htmlFor="ct-dept" className="mb-1 block text-xs font-medium text-slate-500">Department</label><select id="ct-dept" value={dept} onChange={(e) => setDept(e.target.value)} className={inputClass}><option value="all">All</option>{org.departments.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}</select></div>
        <div><label htmlFor="ct-vis" className="mb-1 block text-xs font-medium text-slate-500">Visibility</label><select id="ct-vis" value={visibility} onChange={(e) => setVisibility(e.target.value)} className={inputClass}><option value="all">All</option><option value="Visible">Visible</option><option value="Hidden">Hidden</option></select></div>
        <div><label htmlFor="ct-route" className="mb-1 block text-xs font-medium text-slate-500">Routing</label><select id="ct-route" value={routing} onChange={(e) => setRouting(e.target.value)} className={inputClass}><option value="all">All</option><option value="Configured">Configured</option><option value="Missing">Missing</option></select></div>
        <button type="button" onClick={() => { setQ(""); setStatus("all"); setDept("all"); setVisibility("all"); setRouting("all"); }} disabled={!anyFilter} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-3 text-sm font-medium text-slate-600 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400 disabled:cursor-not-allowed disabled:opacity-50"><X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden /> Clear</button>
        <p className="ml-auto self-center text-xs text-slate-500"><span className="font-medium text-slate-700">{filtered.length}</span> of {config.categories.length}</p>
      </div>

      {config.categories.length === 0 ? (
        <Panel><InlineEmpty icon={Tags} title="No categories yet" note="Add your first support category." /></Panel>
      ) : filtered.length === 0 ? (
        <Panel><InlineEmpty title="No matching categories" note="Try a different search or clear the filters." /></Panel>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#EAECEE] bg-white">
          <CategoryTable categories={filtered} tickets={tickets} onView={(c) => setDetailsId(c.id)} onEdit={(c) => setForm({ open: true, mode: "edit", catId: c.id })} onMove={(id, dir) => cc.moveCategory(id, dir)} onToggleStatus={toggleCategory} />
        </div>
      )}

      <CategoryFormDrawer open={form.open} mode={form.mode} category={formCat} categories={config.categories} org={org} activeTicketCount={formCat ? activeFor(formCat.name) : 0}
        onClose={() => setForm({ open: false, mode: "add" })}
        onSubmit={(values) => { if (form.mode === "add") { cc.addCategory(values); setToast("Category created."); } else if (form.catId) { cc.updateCategory(form.catId, values); setToast("Category updated."); } setForm({ open: false, mode: "add" }); }} />

      <CategoryDetailsDrawer open={detailsCat !== null} category={detailsCat} activeTickets={detailsCat ? activeFor(detailsCat.name) : 0}
        onClose={() => setDetailsId(null)}
        onEdit={(c) => { setDetailsId(null); setForm({ open: true, mode: "edit", catId: c.id }); }}
        onPreview={(c) => setPreview({ open: true, catId: c.id })}
        onToggleStatus={toggleCategory}
        onAddRequestType={(c) => setRtModal({ open: true, mode: "add", catId: c.id })}
        onEditRequestType={(c, rt) => setRtModal({ open: true, mode: "edit", catId: c.id, rtId: rt.id })}
        onMoveRequestType={(rtId, dir) => detailsCat && cc.moveRequestType(detailsCat.id, rtId, dir)}
        onToggleRequestType={(rt) => detailsCat && toggleRequestType(detailsCat, rt)} />

      {rtModal && rtModalCat && (
        <RequestTypeFormModal open={rtModal.open} mode={rtModal.mode} category={rtModalCat} requestType={rtModalRt}
          onClose={() => setRtModal(null)}
          onSubmit={(values) => { if (rtModal.mode === "add") { cc.addRequestType(rtModalCat.id, values); setToast("Request type added."); } else if (rtModal.rtId) { cc.updateRequestType(rtModalCat.id, rtModal.rtId, values); setToast("Request type updated."); } setRtModal(null); }} />
      )}

      <ImpactConfirmDialog open={deactivateCat !== null} title={`Deactivate ${deactivateCat?.name ?? ""}?`} message="It disappears from new employee requests. Existing tickets are preserved."
        impact={deactivateCat ? [{ label: "Active tickets", value: activeFor(deactivateCat.name) }, { label: "Historical tickets", value: historicalFor(deactivateCat.name) }] : []}
        confirmLabel="Deactivate" onCancel={() => setDeactivateCatId(null)}
        onConfirm={() => { if (deactivateCat) { cc.setCategoryStatus(deactivateCat.id, "Inactive"); setToast(`${deactivateCat.name} deactivated.`); } setDeactivateCatId(null); }} />

      <ImpactConfirmDialog open={deactivateRtObj !== undefined && deactivateRtObj !== null} title={`Deactivate ${deactivateRtObj?.name ?? ""}?`} message="It will be hidden from new requests. Existing tickets keep this label."
        impact={[]} confirmLabel="Deactivate" onCancel={() => setDeactivateRt(null)}
        onConfirm={() => { if (deactivateRtCat && deactivateRtObj) { cc.setRequestTypeStatus(deactivateRtCat.id, deactivateRtObj.id, "Inactive"); setToast(`${deactivateRtObj.name} deactivated.`); } setDeactivateRt(null); }} />

      <EmployeeFormPreviewDrawer open={preview.open} initialCategoryId={preview.catId} onClose={() => setPreview({ open: false })} />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
