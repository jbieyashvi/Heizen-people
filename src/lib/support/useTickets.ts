"use client";

import { useCallback, useEffect, useState } from "react";
import type { TicketRecord } from "@/lib/types";
import { getEmployeeTicketRecords } from "@/lib/support/ticketService";
import { currentEmployee } from "@/lib/data/employee";

type LoadState = "loading" | "ready" | "error";

interface UseTicketsResult {
  tickets: TicketRecord[];
  state: LoadState;
  reload: () => void;
}

/**
 * Single access point for combined (seed + locally-stored) ticket data.
 *
 * Data loads after mount so the initial client render matches the server and
 * avoids a hydration mismatch (localStorage is client-only). A brief loading
 * state lets the table show its skeleton.
 */
export function useTickets(): UseTicketsResult {
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [state, setState] = useState<LoadState>("loading");

  const load = useCallback(() => {
    setState("loading");
    try {
      const merged = getEmployeeTicketRecords(currentEmployee.name);
      setTickets(merged);
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    // Small delay so the skeleton is perceptible on fast machines; also defers
    // the localStorage read to the client.
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  return { tickets, state, reload: load };
}
