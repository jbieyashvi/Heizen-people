"use client";

import { useMemo, useState } from "react";
import { Plus, Users, X } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Panel } from "@/components/agent/Panel";
import { ErrorPanel, InlineEmpty } from "@/components/agent/AgentStates";
import { Toast } from "@/components/support/tickets/detail/Toast";
import type { SupportTeam } from "@/lib/admin/orgTypes";
import { useOrgConfig } from "@/lib/admin/useOrgConfig";
import { teamStats, workloadLevel, type WorkloadLevel } from "@/lib/admin/orgStats";
import { SummaryTiles, inputClass } from "@/components/admin/config/ui";
import { TeamTable } from "@/components/admin/config/TeamTable";
import { TeamFormDrawer } from "@/components/admin/config/TeamFormDrawer";
import { TeamDetailsDrawer } from "@/components/admin/config/TeamDetailsDrawer";
import { AddMemberModal } from "@/components/admin/config/AddMemberModal";
import { RemoveMemberDialog } from "@/components/admin/config/RemoveMemberDialog";
import { ChangeLeadDialog } from "@/components/admin/config/ChangeLeadDialog";
import { DeactivateTeamDialog } from "@/components/admin/config/DeactivateTeamDialog";

const WORKLOADS: WorkloadLevel[] = ["Available", "Balanced", "Near Capacity", "At Capacity"];

export function SupportTeamsView() {
  const org = useOrgConfig();
  const { config, tickets, state } = org;

  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");
  const [status, setStatus] = useState("all");
  const [workload, setWorkload] = useState("all");

  const [form, setForm] = useState<{ open: boolean; mode: "add" | "edit"; teamId?: string }>({ open: false, mode: "add" });
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [addMemberId, setAddMemberId] = useState<string | null>(null);
  const [remove, setRemove] = useState<{ teamId: string; memberId: string } | null>(null);
  const [changeLeadId, setChangeLeadId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const teamWorkload = (team: SupportTeam): WorkloadLevel => {
    const active = teamStats(tickets, team.ticketTeam).active;
    const capacity = config.members.filter((m) => m.teamId === team.id && m.status === "Active").reduce((n, m) => n + m.capacity, 0);
    return workloadLevel(active, capacity);
  };

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return config.teams.filter((t) => {
      if (query) {
        const memberMatch = config.members.some((m) => m.teamId === t.id && m.name.toLowerCase().includes(query));
        if (!t.name.toLowerCase().includes(query) && !memberMatch) return false;
      }
      if (dept !== "all" && t.departmentId !== dept) return false;
      if (status !== "all" && t.status !== status) return false;
      if (workload !== "all" && teamWorkload(t) !== workload) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.teams, config.members, tickets, q, dept, status, workload]);

  const anyFilter = q.trim() !== "" || dept !== "all" || status !== "all" || workload !== "all";
  const clearFilters = () => { setQ(""); setDept("all"); setStatus("all"); setWorkload("all"); };

  if (state === "loading") return <div className="h-96 animate-pulse rounded-lg bg-slate-100" />;
  if (state === "error") return <ErrorPanel onRetry={org.reload} />;

  const detailsTeam = config.teams.find((t) => t.id === detailsId) ?? null;
  const deactivateTeam = config.teams.find((t) => t.id === deactivateId) ?? null;
  const addMemberTeam = config.teams.find((t) => t.id === addMemberId) ?? null;
  const changeLeadTeam = config.teams.find((t) => t.id === changeLeadId) ?? null;
  const removeTeam = remove ? config.teams.find((t) => t.id === remove.teamId) ?? null : null;
  const removeMemberObj = remove ? config.members.find((m) => m.id === remove.memberId) ?? null : null;
  const formTeam = config.teams.find((t) => t.id === form.teamId);

  const activeMembers = config.members.filter((m) => m.status === "Active");
  const summary = [
    { label: "Total Teams", value: config.teams.length },
    { label: "Active Members", value: activeMembers.length },
    { label: "Available Agents", value: activeMembers.filter((m) => m.availability === "Available").length },
    { label: "Tickets Assigned", value: tickets.filter((t) => t.assignedAgent !== null && ["Open", "Assigned", "In Progress", "Waiting for Employee"].includes(t.status)).length },
    { label: "Overloaded Teams", value: config.teams.filter((t) => teamWorkload(t) === "At Capacity").length, tone: "amber" as const },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <Breadcrumb items={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Support Teams" }]} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Support Teams</h2>
            <p className="mt-0.5 text-sm text-slate-500">Manage teams and members responsible for resolving employee requests.</p>
          </div>
          <button type="button" onClick={() => setForm({ open: true, mode: "add" })} className="inline-flex h-9 w-fit items-center gap-1.5 rounded-md bg-heizen-500 px-3.5 text-sm font-medium text-white outline-none transition-colors hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-2">
            <Plus className="h-4 w-4" strokeWidth={2} aria-hidden /> Add Support Team
          </button>
        </div>
      </div>

      <SummaryTiles items={summary} />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-2.5 rounded-lg border border-[#EAECEE] bg-white p-3">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="tm-q" className="mb-1 block text-xs font-medium text-slate-500">Search</label>
          <input id="tm-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search team or member…" className={inputClass} />
        </div>
        <div>
          <label htmlFor="tm-dept" className="mb-1 block text-xs font-medium text-slate-500">Department</label>
          <select id="tm-dept" value={dept} onChange={(e) => setDept(e.target.value)} className={inputClass}>
            <option value="all">All departments</option>
            {config.departments.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="tm-status" className="mb-1 block text-xs font-medium text-slate-500">Status</label>
          <select id="tm-status" value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}><option value="all">All</option><option value="Active">Active</option><option value="Inactive">Inactive</option></select>
        </div>
        <div>
          <label htmlFor="tm-work" className="mb-1 block text-xs font-medium text-slate-500">Workload</label>
          <select id="tm-work" value={workload} onChange={(e) => setWorkload(e.target.value)} className={inputClass}><option value="all">All</option>{WORKLOADS.map((w) => (<option key={w} value={w}>{w}</option>))}</select>
        </div>
        <button type="button" onClick={clearFilters} disabled={!anyFilter} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-3 text-sm font-medium text-slate-600 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400 disabled:cursor-not-allowed disabled:opacity-50"><X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden /> Clear Filters</button>
        <p className="ml-auto self-center text-xs text-slate-500"><span className="font-medium text-slate-700">{filtered.length}</span> of {config.teams.length}</p>
      </div>

      {config.teams.length === 0 ? (
        <Panel><InlineEmpty icon={Users} title="No support teams yet" note="Add your first support team." /></Panel>
      ) : filtered.length === 0 ? (
        <Panel><InlineEmpty title="No matching teams" note="Try a different search or clear the filters." /></Panel>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#EAECEE] bg-white">
          <TeamTable teams={filtered} config={config} tickets={tickets}
            onView={(t) => setDetailsId(t.id)}
            onEdit={(t) => setForm({ open: true, mode: "edit", teamId: t.id })}
            onToggleStatus={(t) => (t.status === "Active" ? setDeactivateId(t.id) : (org.setTeamStatus(t.id, "Active"), setToast(`${t.name} activated.`)))} />
        </div>
      )}

      {/* Form drawer */}
      <TeamFormDrawer open={form.open} mode={form.mode} team={formTeam} departments={config.departments} teams={config.teams}
        onClose={() => setForm({ open: false, mode: "add" })}
        onSubmit={(values) => {
          if (form.mode === "add") { org.addTeam(values); setToast("Support team created."); }
          else if (form.teamId) { org.updateTeam(form.teamId, values); setToast("Team updated."); }
          setForm({ open: false, mode: "add" });
        }} />

      {/* Details drawer */}
      <TeamDetailsDrawer open={detailsTeam !== null} team={detailsTeam} config={config} tickets={tickets}
        onClose={() => setDetailsId(null)}
        onEdit={(t) => { setDetailsId(null); setForm({ open: true, mode: "edit", teamId: t.id }); }}
        onAddMember={(t) => setAddMemberId(t.id)}
        onChangeLead={(t) => setChangeLeadId(t.id)}
        onUpdateMember={(id, patch) => org.updateMember(id, patch)}
        onRemoveMember={(m) => setRemove({ teamId: m.teamId, memberId: m.id })} />

      {/* Deactivate team */}
      <DeactivateTeamDialog open={deactivateTeam !== null} team={deactivateTeam} config={config} tickets={tickets}
        onCancel={() => setDeactivateId(null)}
        onConfirm={(reassignTo) => { if (deactivateTeam) { org.setTeamStatus(deactivateTeam.id, "Inactive", reassignTo); setToast(`${deactivateTeam.name} deactivated.`); } setDeactivateId(null); }} />

      {/* Add member */}
      {addMemberTeam && (
        <AddMemberModal open={addMemberTeam !== null} team={addMemberTeam} config={config}
          onCancel={() => setAddMemberId(null)}
          onAdd={(member) => { org.addMember(member); setAddMemberId(null); setToast(`${member.name} added to ${addMemberTeam.name}.`); }} />
      )}

      {/* Remove member */}
      {removeTeam && (
        <RemoveMemberDialog open={remove !== null} member={removeMemberObj} team={removeTeam} config={config} tickets={tickets}
          onCancel={() => setRemove(null)}
          onConfirm={(reassignTo) => { if (removeMemberObj) { org.removeMember(removeMemberObj.id, reassignTo); setToast(`${removeMemberObj.name} removed.`); } setRemove(null); }} />
      )}

      {/* Change lead */}
      {changeLeadTeam && (
        <ChangeLeadDialog open={changeLeadTeam !== null} team={changeLeadTeam} config={config}
          onCancel={() => setChangeLeadId(null)}
          onConfirm={(memberId) => { org.setTeamLead(changeLeadTeam.id, memberId); setChangeLeadId(null); setToast("Team lead updated."); }} />
      )}

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
