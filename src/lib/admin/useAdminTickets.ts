"use client";

import { useCallback, useEffect, useState } from "react";
import type { AgentTicket } from "@/lib/types";
import { getAllTicketRecords } from "@/lib/support/ticketService";
import { buildAgentTicket } from "@/lib/agent/agentTickets";

type LoadState = "loading" | "ready" | "error";

interface UseAdminTicketsResult {
  tickets: AgentTicket[];
  state: LoadState;
  /** Stable "now" used for SLA + date-range calculations this load. */
  now: string;
  reload: () => void;
}

/** Organization-wide, SLA-enriched tickets for the Admin analytics views. */
export function useAdminTickets(): UseAdminTicketsResult {
  const [tickets, setTickets] = useState<AgentTicket[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [now, setNow] = useState<string>("1970-01-01T00:00:00.000Z");

  const load = useCallback(() => {
    setState("loading");
    try {
      const nowIso = new Date().toISOString();
      setNow(nowIso);
      setTickets(getAllTicketRecords().map((r) => buildAgentTicket(r, nowIso)));
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(load, 200);
    return () => window.clearTimeout(timer);
  }, [load]);

  return { tickets, state, now, reload: load };
}
