"use client";

import { useCallback, useEffect, useState } from "react";
import type { AgentTicket } from "@/lib/types";
import type { Department, OrgConfig, SupportTeam, TeamMember } from "@/lib/admin/orgTypes";
import { getOrgConfig, saveOrgConfig } from "@/lib/admin/orgStore";
import { addAdminActivity } from "@/lib/admin/adminActivity";
import { getAllTicketRecords } from "@/lib/support/ticketService";
import { buildAgentTicket } from "@/lib/agent/agentTickets";
import { reassignMemberTickets, reassignTeamTickets } from "@/lib/admin/reassign";

type LoadState = "loading" | "ready" | "error";

function genId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  return `${prefix}-${Date.now().toString(36)}`;
}

export interface UseOrgConfigResult {
  config: OrgConfig;
  tickets: AgentTicket[];
  now: string;
  state: LoadState;
  reload: () => void;

  addDepartment: (d: Omit<Department, "id">) => void;
  updateDepartment: (id: string, patch: Partial<Department>) => void;
  setDepartmentStatus: (id: string, status: Department["status"], reassignToTicketTeam?: string) => void;

  addTeam: (t: Omit<SupportTeam, "id">) => void;
  updateTeam: (id: string, patch: Partial<SupportTeam>) => void;
  setTeamStatus: (id: string, status: SupportTeam["status"], reassignToTicketTeam?: string) => void;

  addMember: (m: Omit<TeamMember, "id">) => void;
  updateMember: (id: string, patch: Partial<TeamMember>) => void;
  removeMember: (id: string, reassignTo?: { name: string; id: string }) => void;
  setTeamLead: (teamId: string, memberId: string) => void;
}

export function useOrgConfig(): UseOrgConfigResult {
  const [config, setConfig] = useState<OrgConfig>({ departments: [], teams: [], members: [] });
  const [tickets, setTickets] = useState<AgentTicket[]>([]);
  const [now, setNow] = useState("1970-01-01T00:00:00.000Z");
  const [state, setState] = useState<LoadState>("loading");

  const loadTickets = useCallback(() => {
    const nowIso = new Date().toISOString();
    setNow(nowIso);
    setTickets(getAllTicketRecords().map((r) => buildAgentTicket(r, nowIso)));
  }, []);

  const load = useCallback(() => {
    setState("loading");
    try {
      setConfig(getOrgConfig());
      loadTickets();
      setState("ready");
    } catch {
      setState("error");
    }
  }, [loadTickets]);

  useEffect(() => {
    const timer = window.setTimeout(load, 150);
    return () => window.clearTimeout(timer);
  }, [load]);

  /**
   * Apply a pure transform over the persisted config, save, log activity, and
   * update local state. Side effects live here (NOT inside a setState updater)
   * so React StrictMode's double-invoked renders never duplicate them.
   */
  const commit = useCallback((produce: (cur: OrgConfig) => { next: OrgConfig; action: string; entity: string }) => {
    const cur = getOrgConfig();
    const { next, action, entity } = produce(cur);
    saveOrgConfig(next);
    addAdminActivity(action, entity);
    setConfig(next);
  }, []);

  const teamName = (cfg: OrgConfig, teamId: string) => cfg.teams.find((t) => t.id === teamId)?.name ?? teamId;

  const addDepartment = useCallback((d: Omit<Department, "id">) => {
    commit((cur) => ({ next: { ...cur, departments: [...cur.departments, { ...d, id: genId("DEP") }] }, action: "Department created", entity: d.name }));
  }, [commit]);

  const updateDepartment = useCallback((id: string, patch: Partial<Department>) => {
    commit((cur) => {
      const dept = cur.departments.find((x) => x.id === id);
      return { next: { ...cur, departments: cur.departments.map((x) => (x.id === id ? { ...x, ...patch } : x)) }, action: "Department edited", entity: patch.name ?? dept?.name ?? id };
    });
  }, [commit]);

  const setDepartmentStatus = useCallback((id: string, status: Department["status"], reassignToTicketTeam?: string) => {
    if (status === "Inactive" && reassignToTicketTeam) {
      const cur = getOrgConfig();
      for (const t of cur.teams.filter((t) => t.departmentId === id)) reassignTeamTickets(t.ticketTeam, reassignToTicketTeam, "department deactivated");
    }
    commit((cur) => {
      const dept = cur.departments.find((x) => x.id === id);
      const teamIds = new Set(cur.teams.filter((t) => t.departmentId === id).map((t) => t.id));
      return {
        next: {
          ...cur,
          departments: cur.departments.map((x) => (x.id === id ? { ...x, status } : x)),
          teams: cur.teams.map((t) => (teamIds.has(t.id) ? { ...t, status } : t)),
        },
        action: status === "Inactive" ? "Department deactivated" : "Department reactivated",
        entity: dept?.name ?? id,
      };
    });
    loadTickets();
  }, [commit, loadTickets]);

  const addTeam = useCallback((t: Omit<SupportTeam, "id">) => {
    commit((cur) => ({ next: { ...cur, teams: [...cur.teams, { ...t, id: genId("TEAM") }] }, action: "Team created", entity: t.name }));
  }, [commit]);

  const updateTeam = useCallback((id: string, patch: Partial<SupportTeam>) => {
    commit((cur) => {
      const team = cur.teams.find((x) => x.id === id);
      return { next: { ...cur, teams: cur.teams.map((x) => (x.id === id ? { ...x, ...patch } : x)) }, action: "Team edited", entity: patch.name ?? team?.name ?? id };
    });
  }, [commit]);

  const setTeamStatus = useCallback((id: string, status: SupportTeam["status"], reassignToTicketTeam?: string) => {
    const cur0 = getOrgConfig();
    const team0 = cur0.teams.find((t) => t.id === id);
    if (status === "Inactive" && reassignToTicketTeam && team0) reassignTeamTickets(team0.ticketTeam, reassignToTicketTeam, "team deactivated");
    commit((cur) => {
      const team = cur.teams.find((x) => x.id === id);
      return { next: { ...cur, teams: cur.teams.map((x) => (x.id === id ? { ...x, status } : x)) }, action: status === "Inactive" ? "Team deactivated" : "Team reactivated", entity: team?.name ?? id };
    });
    loadTickets();
  }, [commit, loadTickets]);

  const addMember = useCallback((m: Omit<TeamMember, "id">) => {
    commit((cur) => ({ next: { ...cur, members: [...cur.members, { ...m, id: genId("MEM") }] }, action: "Member added", entity: `${m.name} → ${teamName(cur, m.teamId)}` }));
  }, [commit]);

  const updateMember = useCallback((id: string, patch: Partial<TeamMember>) => {
    commit((cur) => {
      const member = cur.members.find((x) => x.id === id);
      return { next: { ...cur, members: cur.members.map((x) => (x.id === id ? { ...x, ...patch } : x)) }, action: "Member updated", entity: member ? `${member.name} → ${teamName(cur, member.teamId)}` : id };
    });
  }, [commit]);

  const removeMember = useCallback((id: string, reassignTo?: { name: string; id: string }) => {
    const cur0 = getOrgConfig();
    const member = cur0.members.find((m) => m.id === id);
    if (member && reassignTo) reassignMemberTickets(member.name, reassignTo);
    commit((cur) => {
      const m = cur.members.find((x) => x.id === id);
      return { next: { ...cur, members: cur.members.filter((x) => x.id !== id) }, action: "Member removed", entity: m ? `${m.name} → ${teamName(cur, m.teamId)}` : id };
    });
    loadTickets();
  }, [commit, loadTickets]);

  const setTeamLead = useCallback((teamId: string, memberId: string) => {
    commit((cur) => {
      const newLead = cur.members.find((m) => m.id === memberId);
      const members = cur.members.map((m) => {
        if (m.teamId !== teamId) return m;
        if (m.id === memberId) return { ...m, role: "Team Lead" as const };
        if (m.role === "Team Lead") return { ...m, role: "Support Agent" as const };
        return m;
      });
      const teams = cur.teams.map((t) => (t.id === teamId && newLead ? { ...t, lead: newLead.name } : t));
      return { next: { ...cur, members, teams }, action: "Team Lead changed", entity: newLead ? `${newLead.name} → ${teamName(cur, teamId)}` : teamId };
    });
  }, [commit]);

  return {
    config, tickets, now, state, reload: load,
    addDepartment, updateDepartment, setDepartmentStatus,
    addTeam, updateTeam, setTeamStatus,
    addMember, updateMember, removeMember, setTeamLead,
  };
}
