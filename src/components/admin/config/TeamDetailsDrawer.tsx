"use client";

import Link from "next/link";
import { Pencil, UserPlus, Crown, Layers, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { AgentTicket } from "@/lib/types";
import type { Availability, MemberRole, OrgConfig, SupportTeam, TeamMember } from "@/lib/admin/orgTypes";
import { Drawer } from "@/components/ui/Drawer";
import { memberStats, teamStats } from "@/lib/admin/orgStats";
import { getAdminActivity } from "@/lib/admin/adminActivity";
import { formatDisplayDateTime } from "@/lib/support/dateFormat";
import { StatusTag } from "@/components/admin/config/ui";

interface Props {
  open: boolean;
  team: SupportTeam | null;
  config: OrgConfig;
  tickets: AgentTicket[];
  onClose: () => void;
  onEdit: (t: SupportTeam) => void;
  onAddMember: (t: SupportTeam) => void;
  onChangeLead: (t: SupportTeam) => void;
  onUpdateMember: (id: string, patch: Partial<TeamMember>) => void;
  onRemoveMember: (m: TeamMember) => void;
}

const WORKLOAD_STYLE: Record<string, string> = {
  Available: "bg-emerald-50 text-emerald-700",
  Balanced: "bg-heizen-50 text-heizen-700",
  "Near Capacity": "bg-amber-50 text-amber-800",
  "At Capacity": "bg-red-50 text-red-700",
};

function Stat({ label, value, tone = "default" }: { label: string; value: string | number; tone?: "default" | "red" }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-[#EAECEE] px-3 py-2">
      <span className={tone === "red" ? "text-lg font-semibold tabular-nums text-red-600" : "text-lg font-semibold tabular-nums text-slate-900"}>{value}</span>
      <span className="text-[11px] text-slate-500">{label}</span>
    </div>
  );
}

const selCls = "h-7 rounded-md border border-[#EAECEE] bg-white px-1.5 text-xs text-slate-700 outline-none focus:border-heizen-300 focus:ring-2 focus:ring-heizen-100";

export function TeamDetailsDrawer({ open, team, config, tickets, onClose, onEdit, onAddMember, onChangeLead, onUpdateMember, onRemoveMember }: Props) {
  if (!open || !team) return null;

  const dept = config.departments.find((d) => d.id === team.departmentId);
  const members = config.members.filter((m) => m.teamId === team.id);
  const s = teamStats(tickets, team.ticketTeam);
  const activity = getAdminActivity().filter((e) => e.entity.includes(team.name)).slice(0, 6);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={team.name}
      description={`${dept?.name ?? "—"} · ${team.code}`}
      widthClass="max-w-xl"
      footer={
        <>
          <Link href={`/admin/tickets?team=${encodeURIComponent(team.ticketTeam)}`} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-3 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400"><Layers className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden /> View Tickets</Link>
          <button type="button" onClick={() => onChangeLead(team)} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-3 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400"><Crown className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden /> Change Lead</button>
          <button type="button" onClick={() => onAddMember(team)} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-3 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400"><UserPlus className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden /> Add Member</button>
          <button type="button" onClick={() => onEdit(team)} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-heizen-500 px-3 text-sm font-medium text-white outline-none hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-2"><Pencil className="h-4 w-4" strokeWidth={2} aria-hidden /> Edit</button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2"><StatusTag status={team.status} /><span className="text-xs text-slate-400">Lead: <span className="font-medium text-slate-600">{team.lead}</span></span></div>
        {team.description && <p className="text-sm text-slate-600">{team.description}</p>}

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Stat label="Active" value={s.active} />
          <Stat label="Unassigned" value={s.unassigned} tone={s.unassigned > 0 ? "red" : "default"} />
          <Stat label="Due soon" value={s.dueSoon} />
          <Stat label="Overdue" value={s.overdue} tone={s.overdue > 0 ? "red" : "default"} />
        </div>

        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Categories handled</h3>
          <p className="text-sm text-slate-600">{dept?.categories.join(", ") || "—"}</p>
        </section>

        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Support members ({members.length})</h3>
            <span className="text-[11px] text-slate-400">SLA compliance {s.sla}%</span>
          </div>
          {members.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#DDE1E4] px-4 py-6 text-center">
              <p className="text-sm text-slate-500">This team has no members yet.</p>
              <button type="button" onClick={() => onAddMember(team)} className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-3 text-xs font-medium text-heizen-700 outline-none hover:bg-heizen-50 focus-visible:ring-2 focus-visible:ring-heizen-400"><UserPlus className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden /> Add Member</button>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {members.map((m) => {
                const ms = memberStats(tickets, m);
                return (
                  <li key={m.id} className="rounded-lg border border-[#EAECEE] px-3 py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-heizen-100 text-xs font-semibold text-heizen-700">{m.initials}</span>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{m.name}{m.role === "Team Lead" && <span className="ml-1.5 inline-flex items-center gap-0.5 rounded bg-heizen-50 px-1 text-[10px] font-semibold text-heizen-700"><Crown className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />Lead</span>}</p>
                          <p className="text-[11px] text-slate-400">{m.email}</p>
                        </div>
                      </div>
                      <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", WORKLOAD_STYLE[ms.workload])}>{ms.workload}</span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                      <span>{ms.active} active</span><span>·</span><span>{ms.dueSoon} due soon</span><span>·</span>
                      <span className={ms.overdue > 0 ? "font-medium text-red-600" : ""}>{ms.overdue} overdue</span><span>·</span><span>{ms.resolved} resolved</span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <label className="sr-only" htmlFor={`role-${m.id}`}>Role for {m.name}</label>
                      <select id={`role-${m.id}`} value={m.role} onChange={(e) => onUpdateMember(m.id, { role: e.target.value as MemberRole })} className={selCls}><option>Support Agent</option><option>Team Lead</option></select>
                      <label className="sr-only" htmlFor={`avail-${m.id}`}>Availability for {m.name}</label>
                      <select id={`avail-${m.id}`} value={m.availability} onChange={(e) => onUpdateMember(m.id, { availability: e.target.value as Availability })} className={selCls}><option>Available</option><option>Limited</option><option>Unavailable</option></select>
                      <button type="button" onClick={() => onRemoveMember(m)} className="ml-auto inline-flex h-7 items-center gap-1 rounded-md border border-[#EAECEE] px-2 text-xs font-medium text-slate-600 outline-none hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:ring-2 focus-visible:ring-heizen-400"><Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden /> Remove</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Recent assignments &amp; activity</h3>
          {activity.length === 0 ? (
            <p className="text-sm text-slate-400">No recent activity.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {activity.map((e) => (<li key={e.id} className="text-xs text-slate-500"><span className="font-medium text-slate-700">{e.action}</span> · {e.entity} · {formatDisplayDateTime(e.at)}</li>))}
            </ul>
          )}
        </section>
      </div>
    </Drawer>
  );
}
