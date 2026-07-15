"use client";

import Link from "next/link";
import { Pencil, Plus, Layers } from "lucide-react";
import type { AgentTicket } from "@/lib/types";
import type { Department, OrgConfig } from "@/lib/admin/orgTypes";
import { Drawer } from "@/components/ui/Drawer";
import { departmentStats, teamsForDepartment } from "@/lib/admin/orgStats";
import { getActivityForEntity } from "@/lib/admin/adminActivity";
import { formatDisplayDateTime } from "@/lib/support/dateFormat";
import { StatusTag } from "@/components/admin/config/ui";

interface Props {
  open: boolean;
  department: Department | null;
  config: OrgConfig;
  tickets: AgentTicket[];
  onClose: () => void;
  onEdit: (d: Department) => void;
  onAddTeam: (d: Department) => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</h3>
      {children}
    </section>
  );
}

export function DepartmentDetailsDrawer({ open, department, config, tickets, onClose, onEdit, onAddTeam }: Props) {
  if (!open || !department) return null;

  const stats = departmentStats(config, tickets, department);
  const teams = teamsForDepartment(config, department.id);
  const teamIds = new Set(teams.map((t) => t.id));
  const members = config.members.filter((m) => teamIds.has(m.teamId));
  const activity = getActivityForEntity(department.name).slice(0, 6);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={department.name}
      description={`Department · ${department.code}`}
      widthClass="max-w-lg"
      footer={
        <>
          <Link href={`/admin/tickets?department=${encodeURIComponent(department.code)}`} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400">
            <Layers className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden /> View Tickets
          </Link>
          <button type="button" onClick={() => onAddTeam(department)} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400">
            <Plus className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden /> Add Support Team
          </button>
          <button type="button" onClick={() => onEdit(department)} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-heizen-500 px-3.5 text-sm font-medium text-white outline-none hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-2">
            <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden /> Edit Department
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2"><StatusTag status={department.status} /></div>
        <p className="text-sm text-slate-600">{department.description}</p>

        <Section title="Information">
          <dl className="divide-y divide-[#EAECEE] rounded-lg border border-[#EAECEE]">
            <Row label="Lead">{department.lead}</Row>
            <Row label="Support Email"><a href={`mailto:${department.supportEmail}`} className="text-heizen-700 hover:text-heizen-800">{department.supportEmail}</a></Row>
            <Row label="Categories Handled">{department.categories.join(", ") || "—"}</Row>
          </dl>
        </Section>

        <div className="grid grid-cols-3 gap-2.5">
          <Stat label="Active tickets" value={stats.activeTickets} />
          <Stat label="Overdue" value={stats.overdue} tone={stats.overdue > 0 ? "red" : "default"} />
          <Stat label="SLA compliance" value={`${stats.sla}%`} />
        </div>

        <Section title={`Support Teams (${teams.length})`}>
          {teams.length === 0 ? (
            <p className="text-sm text-slate-400">This department has no teams yet.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {teams.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-2 rounded-md border border-[#EAECEE] px-3 py-2">
                  <span className="min-w-0"><span className="text-sm font-medium text-slate-700">{t.name}</span><span className="ml-2 text-xs text-slate-400">{t.ticketTeam}</span></span>
                  <StatusTag status={t.status} />
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title={`Support Members (${members.length})`}>
          {members.length === 0 ? (
            <p className="text-sm text-slate-400">No members yet.</p>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {members.map((m) => (
                <li key={m.id} className="inline-flex items-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-2 py-1 text-xs text-slate-600">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-heizen-100 text-[10px] font-semibold text-heizen-700">{m.initials}</span>
                  {m.name}<span className="text-slate-400">· {m.role}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Recent department activity">
          {activity.length === 0 ? (
            <p className="text-sm text-slate-400">No recent configuration activity.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {activity.map((e) => (
                <li key={e.id} className="text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{e.action}</span> · {e.admin} · {formatDisplayDateTime(e.at)}
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </Drawer>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2">
      <dt className="text-xs font-medium text-slate-400">{label}</dt>
      <dd className="min-w-0 truncate text-right text-sm font-medium text-slate-700">{children}</dd>
    </div>
  );
}

function Stat({ label, value, tone = "default" }: { label: string; value: string | number; tone?: "default" | "red" }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-[#EAECEE] px-3 py-2">
      <span className={tone === "red" ? "text-lg font-semibold tabular-nums text-red-600" : "text-lg font-semibold tabular-nums text-slate-900"}>{value}</span>
      <span className="text-[11px] text-slate-500">{label}</span>
    </div>
  );
}
