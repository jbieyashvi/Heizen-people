"use client";

import { useCallback, useEffect, useState } from "react";
import type { MessageAttachment, TicketDetail, TicketPriority, TicketStatus } from "@/lib/types";
import { getTicketDetail } from "@/lib/support/ticketService";
import { saveStoredDetail } from "@/lib/store/ticketStore";
import { AGENT_TEAM, currentAgent } from "@/lib/roles/roles";
import {
  applyAgentReply,
  applyAssignment,
  applyEscalate,
  applyInternalNote,
  applyMerge,
  applyPriorityChange,
  applyStatusChange,
  type ReplyFollowUp,
} from "@/lib/support/statusTransitions";
import { createNotification } from "@/lib/notifications/notify";

type LoadState = "loading" | "ready" | "notfound" | "denied" | "merged" | "error";

function nowIso(): string {
  return new Date().toISOString();
}

export interface UseAgentTicketDetailResult {
  detail: TicketDetail | null;
  state: LoadState;
  now: string;
  reload: () => void;
  reply: (input: { bodyHtml: string; attachments: MessageAttachment[] }, followUp: ReplyFollowUp) => void;
  addNote: (input: { bodyHtml: string; attachments: MessageAttachment[] }) => void;
  changeStatus: (status: TicketStatus, opts?: { resolutionSummary?: string; closingNote?: string }) => void;
  changePriority: (priority: TicketPriority, reason?: string) => void;
  assign: (agentName: string, agentId: string) => void;
  escalate: (input: { target: string; reason: string; note?: string }) => void;
  merge: (duplicateId: string) => void;
}

/**
 * Loads and mutates a single ticket for the Support Agent detail view.
 * `orgWide` (Admin) bypasses the team-scoped permission check.
 */
export function useAgentTicketDetail(ticketId: string, opts?: { orgWide?: boolean }): UseAgentTicketDetailResult {
  const orgWide = opts?.orgWide ?? false;
  const [detail, setDetail] = useState<TicketDetail | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [now, setNow] = useState<string>("1970-01-01T00:00:00.000Z");

  const load = useCallback(() => {
    setState("loading");
    try {
      setNow(nowIso());
      const found = getTicketDetail(ticketId);
      if (!found) {
        setDetail(null);
        setState("notfound");
        return;
      }
      if (!orgWide && found.assignedTeam !== AGENT_TEAM) {
        setDetail(found);
        setState("denied");
        return;
      }
      setDetail(found);
      setState(found.mergedIntoTicketId ? "merged" : "ready");
    } catch {
      setState("error");
    }
  }, [ticketId, orgWide]);

  useEffect(() => {
    const timer = window.setTimeout(load, 200);
    return () => window.clearTimeout(timer);
  }, [load]);

  const mutate = useCallback((producer: (cur: TicketDetail) => TicketDetail) => {
    setDetail((cur) => {
      if (!cur) return cur;
      const next = producer(cur);
      saveStoredDetail(next);
      return next;
    });
  }, []);

  const reply = useCallback(
    (input: { bodyHtml: string; attachments: MessageAttachment[] }, followUp: ReplyFollowUp) => {
      mutate((cur) => applyAgentReply(cur, input, followUp, nowIso()));
      createNotification(ticketId, "agent-replied", "The support team replied to your ticket.");
      if (followUp === "wait")
        createNotification(ticketId, "info-requested", "The support team needs more information.");
      if (followUp === "resolve")
        createNotification(ticketId, "resolved", "Your ticket was marked as resolved.");
    },
    [mutate, ticketId],
  );

  const addNote = useCallback(
    (input: { bodyHtml: string; attachments: MessageAttachment[] }) => {
      // Internal note — no employee notification.
      mutate((cur) => applyInternalNote(cur, input, nowIso()));
    },
    [mutate],
  );

  const changeStatus = useCallback(
    (status: TicketStatus, opts?: { resolutionSummary?: string; closingNote?: string }) => {
      mutate((cur) => applyStatusChange(cur, status, nowIso(), opts));
      if (status === "Resolved") createNotification(ticketId, "resolved", "Your ticket was resolved.");
      else if (status === "Closed") createNotification(ticketId, "closed", "Your ticket was closed.");
      else if (status === "Waiting for Employee")
        createNotification(ticketId, "info-requested", "The support team needs more information.");
      else createNotification(ticketId, "status-changed", `Your ticket status changed to ${status}.`);
    },
    [mutate, ticketId],
  );

  const changePriority = useCallback(
    (priority: TicketPriority, reason?: string) => {
      mutate((cur) => applyPriorityChange(cur, priority, nowIso(), reason));
      createNotification(ticketId, "priority-changed", `Ticket priority changed to ${priority}.`);
    },
    [mutate, ticketId],
  );

  const assign = useCallback(
    (agentName: string, agentId: string) => {
      // Reassignment is internal — no employee notification.
      mutate((cur) =>
        applyAssignment(cur, { agentName, agentId, actorName: currentAgent.name }, nowIso()),
      );
    },
    [mutate],
  );

  const escalate = useCallback(
    (input: { target: string; reason: string; note?: string }) => {
      // Internal escalation — no employee notification.
      mutate((cur) => applyEscalate(cur, input, nowIso()));
    },
    [mutate],
  );

  const merge = useCallback(
    (duplicateId: string) => {
      setDetail((cur) => {
        if (!cur) return cur;
        const dup = getTicketDetail(duplicateId);
        if (!dup) return cur;
        const { primary, duplicate } = applyMerge(cur, dup, nowIso());
        saveStoredDetail(duplicate);
        saveStoredDetail(primary);
        createNotification(duplicateId, "closed", "Your ticket was merged and closed.");
        return primary;
      });
    },
    [],
  );

  return {
    detail,
    state,
    now,
    reload: load,
    reply,
    addNote,
    changeStatus,
    changePriority,
    assign,
    escalate,
    merge,
  };
}
