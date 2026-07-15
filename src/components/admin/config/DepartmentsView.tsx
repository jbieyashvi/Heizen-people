"use client";

import { useMemo, useState } from "react";
import { Plus, Building2, X } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Panel } from "@/components/agent/Panel";
import { ErrorPanel, InlineEmpty } from "@/components/agent/AgentStates";
import { Toast } from "@/components/support/tickets/detail/Toast";
import type { Department } from "@/lib/admin/orgTypes";
import { useOrgConfig } from "@/lib/admin/useOrgConfig";
import { teamsForDepartment } from "@/lib/admin/orgStats";
import { SummaryTiles, inputClass } from "@/components/admin/config/ui";
import { DepartmentTable } from "@/components/admin/config/DepartmentTable";
import { DepartmentFormDrawer } from "@/components/admin/config/DepartmentFormDrawer";
import { DepartmentDetailsDrawer } from "@/components/admin/config/DepartmentDetailsDrawer";
import { DeactivateDepartmentDialog } from "@/components/admin/config/DeactivateDepartmentDialog";
import { TeamFormDrawer } from "@/components/admin/config/TeamFormDrawer";

export function DepartmentsView() {
  const org = useOrgConfig();
  const { config, tickets, state } = org;

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [lead, setLead] = useState("all");

  const [form, setForm] = useState<{ open: boolean; mode: "add" | "edit"; dept?: Department }>({ open: false, mode: "add" });
  const [details, setDetails] = useState<Department | null>(null);
  const [deactivate, setDeactivate] = useState<Department | null>(null);
  const [teamForm, setTeamForm] = useState<{ open: boolean; deptId?: string }>({ open: false });
  const [toast, setToast] = useState<string | null>(null);

  const leads = useMemo(() => [...new Set(config.departments.map((d) => d.lead))], [config.departments]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return config.departments.filter((d) => {
      if (query && !`${d.name} ${d.code}`.toLowerCase().includes(query)) return false;
      if (status !== "all" && d.status !== status) return false;
      if (lead !== "all" && d.lead !== lead) return false;
      return true;
    });
  }, [config.departments, q, status, lead]);

  const anyFilter = q.trim() !== "" || status !== "all" || lead !== "all";
  const clearFilters = () => { setQ(""); setStatus("all"); setLead("all"); };

  if (state === "loading") {
    return <div className="h-96 animate-pulse rounded-lg bg-slate-100" />;
  }
  if (state === "error") {
    return <ErrorPanel onRetry={org.reload} />;
  }

  const summary = [
    { label: "Total Departments", value: config.departments.length },
    { label: "Active Departments", value: config.departments.filter((d) => d.status === "Active").length },
    { label: "Total Support Teams", value: config.teams.length },
    { label: "Total Support Members", value: config.members.length },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Breadcrumb items={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Departments" }]} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Departments</h2>
            <p className="mt-0.5 text-sm text-slate-500">Configure the departments responsible for employee support requests.</p>
          </div>
          <button type="button" onClick={() => setForm({ open: true, mode: "add" })} className="inline-flex h-9 w-fit items-center gap-1.5 rounded-md bg-heizen-500 px-3.5 text-sm font-medium text-white outline-none transition-colors hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-2">
            <Plus className="h-4 w-4" strokeWidth={2} aria-hidden /> Add Department
          </button>
        </div>
      </div>

      <SummaryTiles items={summary} />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-2.5 rounded-lg border border-[#EAECEE] bg-white p-3">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="dep-q" className="mb-1 block text-xs font-medium text-slate-500">Search</label>
          <input id="dep-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or code…" className={inputClass} />
        </div>
        <div>
          <label htmlFor="dep-status" className="mb-1 block text-xs font-medium text-slate-500">Status</label>
          <select id="dep-status" value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
            <option value="all">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label htmlFor="dep-lead" className="mb-1 block text-xs font-medium text-slate-500">Lead</label>
          <select id="dep-lead" value={lead} onChange={(e) => setLead(e.target.value)} className={inputClass}>
            <option value="all">All leads</option>
            {leads.map((l) => (<option key={l} value={l}>{l}</option>))}
          </select>
        </div>
        <button type="button" onClick={clearFilters} disabled={!anyFilter} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-3 text-sm font-medium text-slate-600 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400 disabled:cursor-not-allowed disabled:opacity-50">
          <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden /> Clear Filters
        </button>
        <p className="ml-auto self-center text-xs text-slate-500"><span className="font-medium text-slate-700">{filtered.length}</span> of {config.departments.length}</p>
      </div>

      {/* Table */}
      {config.departments.length === 0 ? (
        <Panel><InlineEmpty icon={Building2} title="No departments yet" note="Add your first support department to get started." /></Panel>
      ) : filtered.length === 0 ? (
        <Panel><InlineEmpty title="No matching departments" note="Try a different search or clear the filters." /></Panel>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#EAECEE] bg-white">
          <DepartmentTable
            departments={filtered}
            config={config}
            tickets={tickets}
            onView={(d) => setDetails(d)}
            onEdit={(d) => setForm({ open: true, mode: "edit", dept: d })}
            onToggleStatus={(d) => (d.status === "Active" ? setDeactivate(d) : (org.setDepartmentStatus(d.id, "Active"), setToast(`${d.name} activated.`)))}
          />
        </div>
      )}

      {/* Drawers & dialogs */}
      <DepartmentFormDrawer
        open={form.open}
        mode={form.mode}
        department={form.dept}
        departments={config.departments}
        codeLocked={form.mode === "edit" && !!form.dept && teamsForDepartment(config, form.dept.id).length > 0}
        onClose={() => setForm({ open: false, mode: "add" })}
        onSubmit={(values) => {
          if (form.mode === "add") { org.addDepartment(values); setToast("Department created."); }
          else if (form.dept) { org.updateDepartment(form.dept.id, values); setToast("Department updated."); }
          setForm({ open: false, mode: "add" });
        }}
      />

      <DepartmentDetailsDrawer
        open={details !== null}
        department={details}
        config={config}
        tickets={tickets}
        onClose={() => setDetails(null)}
        onEdit={(d) => { setDetails(null); setForm({ open: true, mode: "edit", dept: d }); }}
        onAddTeam={(d) => { setDetails(null); setTeamForm({ open: true, deptId: d.id }); }}
      />

      <DeactivateDepartmentDialog
        open={deactivate !== null}
        department={deactivate}
        config={config}
        tickets={tickets}
        onCancel={() => setDeactivate(null)}
        onConfirm={(reassignTo) => {
          if (deactivate) { org.setDepartmentStatus(deactivate.id, "Inactive", reassignTo); setToast(`${deactivate.name} deactivated.`); }
          setDeactivate(null);
        }}
      />

      <TeamFormDrawer
        open={teamForm.open}
        mode="add"
        departments={config.departments}
        teams={config.teams}
        presetDepartmentId={teamForm.deptId}
        onClose={() => setTeamForm({ open: false })}
        onSubmit={(values) => { org.addTeam(values); setTeamForm({ open: false }); setToast("Support team created."); }}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
