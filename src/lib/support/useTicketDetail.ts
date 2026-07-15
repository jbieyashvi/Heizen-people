"use client";

import { useCallback, useEffect, useState } from "react";
import type { MessageAttachment, TicketDetail } from "@/lib/types";
import { getTicketDetail } from "@/lib/support/ticketService";
import { saveStoredDetail } from "@/lib/store/ticketStore";
import {
  applyClose,
  applyReopen,
  applyReply,
  applyResolve,
  autoCloseIfExpired,
} from "@/lib/support/statusTransitions";

type LoadState = "loading" | "ready" | "notfound" | "error";

export interface UseTicketDetailResult {
  detail: TicketDetail | null;
  state: LoadState;
  reload: () => void;
  reply: (input: { bodyHtml: string; attachments: MessageAttachment[] }) => void;
  resolve: () => void;
  reopen: (input: { reason: string; attachments: MessageAttachment[] }) => void;
  close: () => void;
}

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Loads and mutates a single ticket's full detail. All persistence goes through
 * the ticket store; transition logic is centralised in statusTransitions.
 */
export function useTicketDetail(ticketId: string): UseTicketDetailResult {
  const [detail, setDetail] = useState<TicketDetail | null>(null);
  const [state, setState] = useState<LoadState>("loading");

  const load = useCallback(() => {
    setState("loading");
    try {
      const found = getTicketDetail(ticketId);
      if (!found) {
        setDetail(null);
        setState("notfound");
        return;
      }
      // Migration/auto-close: a resolved ticket past its reopen window closes.
      const { detail: next, changed } = autoCloseIfExpired(found, nowIso());
      if (changed) saveStoredDetail(next);
      setDetail(next);
      setState("ready");
    } catch {
      setState("error");
    }
  }, [ticketId]);

  useEffect(() => {
    const timer = window.setTimeout(load, 200);
    return () => window.clearTimeout(timer);
  }, [load]);

  const reply = useCallback(
    (input: { bodyHtml: string; attachments: MessageAttachment[] }) => {
      setDetail((cur) => {
        if (!cur) return cur;
        const next = applyReply(cur, input, nowIso());
        saveStoredDetail(next);
        return next;
      });
    },
    [],
  );

  const resolve = useCallback(() => {
    setDetail((cur) => {
      if (!cur) return cur;
      const next = applyResolve(cur, nowIso());
      saveStoredDetail(next);
      return next;
    });
  }, []);

  const reopen = useCallback(
    (input: { reason: string; attachments: MessageAttachment[] }) => {
      setDetail((cur) => {
        if (!cur) return cur;
        const next = applyReopen(cur, input, nowIso());
        saveStoredDetail(next);
        return next;
      });
    },
    [],
  );

  const close = useCallback(() => {
    setDetail((cur) => {
      if (!cur) return cur;
      const next = applyClose(cur, nowIso());
      saveStoredDetail(next);
      return next;
    });
  }, []);

  return { detail, state, reload: load, reply, resolve, reopen, close };
}
