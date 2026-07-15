"use client";

import { useCallback, useEffect, useState } from "react";
import type { AgentTicket } from "@/lib/types";
import { getAgentTickets } from "@/lib/agent/agentTickets";
import { getTicketDetail } from "@/lib/support/ticketService";
import { saveStoredDetail } from "@/lib/store/ticketStore";
import { applyAssignment } from "@/lib/support/statusTransitions";
import { AGENT_TEAM, currentAgent } from "@/lib/roles/roles";

type LoadState = "loading" | "ready" | "error";

export interface AssignInput {
  agentName: string;
  agentId: string;
}

interface UseAgentTicketsResult {
  tickets: AgentTicket[];
  state: LoadState;
  /** Stable "now" used for all SLA calculations in this load. */
  now: string;
  reload: () => void;
  /** Assign or reassign a ticket, persist, and refresh the list. */
  assign: (ticketId: string, input: AssignInput) => void;
}

/** Loads the agent's team-scoped tickets (SLA-enriched) and supports assignment. */
export function useAgentTickets(): UseAgentTicketsResult {
  const [tickets, setTickets] = useState<AgentTicket[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [now, setNow] = useState<string>("1970-01-01T00:00:00.000Z");

  const load = useCallback(() => {
    setState("loading");
    try {
      const nowIso = new Date().toISOString();
      setNow(nowIso);
      setTickets(getAgentTickets(AGENT_TEAM, nowIso));
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(load, 200);
    return () => window.clearTimeout(timer);
  }, [load]);

  const assign = useCallback((ticketId: string, input: AssignInput) => {
    const detail = getTicketDetail(ticketId);
    if (!detail) return;
    const next = applyAssignment(
      detail,
      { agentName: input.agentName, agentId: input.agentId, actorName: currentAgent.name },
      new Date().toISOString(),
    );
    saveStoredDetail(next);
    // Recompute the whole list so queues + counts update immediately.
    const nowIso = new Date().toISOString();
    setNow(nowIso);
    setTickets(getAgentTickets(AGENT_TEAM, nowIso));
  }, []);

  return { tickets, state, now, reload: load, assign };
}
