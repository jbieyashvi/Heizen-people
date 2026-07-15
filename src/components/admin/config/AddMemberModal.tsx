"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Availability, MemberRole, OrgConfig, SupportTeam, TeamMember } from "@/lib/admin/orgTypes";
import { Dialog } from "@/components/ui/Dialog";
import { SUPPORT_STAFF } from "@/lib/admin/orgConfig";
import { Field, inputClass } from "@/components/admin/config/ui";

interface Props {
  open: boolean;
  team: SupportTeam;
  config: OrgConfig;
  onCancel: () => void;
  onAdd: (member: Omit<TeamMember, "id">) => void;
}

export function AddMemberModal({ open, team, config, onCancel, onAdd }: Props) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [role, setRole] = useState<MemberRole>("Support Agent");
  const [availability, setAvailability] = useState<Availability>("Available");
  const [capacity, setCapacity] = useState(15);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) { setQ(""); setSelected(null); setRole("Support Agent"); setAvailability("Available"); setCapacity(15); setError(null); }
  }, [open, team]);

  // Exclude staff already active on this team (prevents duplicate membership).
  const existing = useMemo(() => new Set(config.members.filter((m) => m.teamId === team.id && m.status === "Active").map((m) => m.name)), [config.members, team.id]);
  const candidates = useMemo(() => {
    const query = q.trim().toLowerCase();
    return SUPPORT_STAFF.filter((s) => !existing.has(s.name)).filter((s) => !query || s.name.toLowerCase().includes(query));
  }, [q, existing]);

  if (!open) return null;

  function add() {
    const staff = SUPPORT_STAFF.find((s) => s.name === selected);
    if (!staff) { setError("Select an employee to add."); return; }
    onAdd({ teamId: team.id, name: staff.name, email: staff.email, initials: staff.initials, role, availability, capacity, status: "Active" });
  }

  return (
    <Dialog open={open} onClose={onCancel} labelledBy="addm-title">
      <h2 id="addm-title" className="text-sm font-semibold text-slate-900">Add Support Member</h2>
      <p className="mt-0.5 text-xs text-slate-500">Add a support-eligible employee to {team.name}.</p>

      <div className="relative mt-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={1.75} aria-hidden />
        <label htmlFor="addm-search" className="sr-only">Search employee</label>
        <input id="addm-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search employee…" className="h-9 w-full rounded-md border border-[#EAECEE] bg-white pl-9 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-heizen-300 focus:ring-2 focus:ring-heizen-100" />
      </div>

      <div className="mt-2 max-h-44 overflow-y-auto">
        {candidates.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">No available employees to add.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {candidates.map((s) => (
              <li key={s.name}>
                <label className={cn("flex cursor-pointer items-center gap-2.5 rounded-md border px-2.5 py-1.5 outline-none transition-colors", selected === s.name ? "border-heizen-300 bg-heizen-50" : "border-[#EAECEE] bg-white hover:bg-slate-50")}>
                  <input type="radio" name="addm" checked={selected === s.name} onChange={() => { setSelected(s.name); setError(null); }} className="sr-only" />
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-heizen-100 text-[10px] font-semibold text-heizen-700">{s.initials}</span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-slate-800">{s.name}</span><span className="block truncate text-[11px] text-slate-400">{s.email}</span></span>
                  {selected === s.name && <Check className="h-4 w-4 text-heizen-600" strokeWidth={2} aria-hidden />}
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Field label="Role" htmlFor="addm-role"><select id="addm-role" value={role} onChange={(e) => setRole(e.target.value as MemberRole)} className={inputClass}><option>Support Agent</option><option>Team Lead</option></select></Field>
        <Field label="Availability" htmlFor="addm-avail"><select id="addm-avail" value={availability} onChange={(e) => setAvailability(e.target.value as Availability)} className={inputClass}><option>Available</option><option>Limited</option><option>Unavailable</option></select></Field>
        <Field label="Assignment Capacity" htmlFor="addm-cap"><input id="addm-cap" type="number" min={1} max={50} value={capacity} onChange={(e) => setCapacity(Math.max(1, Number(e.target.value) || 1))} className={inputClass} /></Field>
      </div>

      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}

      <div className="mt-4 flex justify-end gap-2.5">
        <button type="button" onClick={onCancel} className="inline-flex h-9 items-center rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400">Cancel</button>
        <button type="button" onClick={add} className="inline-flex h-9 items-center rounded-md bg-heizen-500 px-3.5 text-sm font-medium text-white outline-none hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-2">Add to Team</button>
      </div>
    </Dialog>
  );
}
