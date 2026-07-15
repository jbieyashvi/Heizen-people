import type {
  ActivityEvent,
  ConversationMessage,
  MessageAttachment,
  TicketDetail,
  TicketPriority,
  TicketStatus,
} from "@/lib/types";
import { currentEmployee } from "@/lib/data/employee";
import { currentAgent } from "@/lib/roles/roles";

export const REOPEN_WINDOW_DAYS = 7;
const WINDOW_MS = REOPEN_WINDOW_DAYS * 24 * 60 * 60 * 1000;

const ACTIVE_STATUSES: TicketStatus[] = [
  "Open",
  "Assigned",
  "In Progress",
  "Waiting for Employee",
];

function uid(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
}

/** Milliseconds remaining in the reopen window, or 0 if elapsed/not resolved. */
export function reopenWindowRemainingMs(detail: TicketDetail, nowIso: string): number {
  if (detail.status !== "Resolved" || !detail.resolvedAt) return 0;
  const elapsed = new Date(nowIso).getTime() - new Date(detail.resolvedAt).getTime();
  return Math.max(0, WINDOW_MS - elapsed);
}

export function isWithinReopenWindow(detail: TicketDetail, nowIso: string): boolean {
  return reopenWindowRemainingMs(detail, nowIso) > 0;
}

/** Resolved, but the seven-day reopen window has elapsed. */
export function reopenWindowEnded(detail: TicketDetail, nowIso: string): boolean {
  return (
    detail.status === "Resolved" &&
    !!detail.resolvedAt &&
    reopenWindowRemainingMs(detail, nowIso) === 0
  );
}

/* ---------------------------- Permissions --------------------------------- */

export interface TicketPermissions {
  canReply: boolean;
  canMarkResolved: boolean;
  canReopen: boolean;
  canClose: boolean;
  isClosed: boolean;
}

export function getPermissions(detail: TicketDetail, nowIso: string): TicketPermissions {
  const active = ACTIVE_STATUSES.includes(detail.status);
  return {
    canReply: active,
    canMarkResolved: active,
    canReopen: detail.status === "Resolved" && isWithinReopenWindow(detail, nowIso),
    canClose: detail.status === "Resolved",
    isClosed: detail.status === "Closed",
  };
}

/* ----------------------------- Transitions -------------------------------- */

function daysLabel(): string {
  return `${REOPEN_WINDOW_DAYS} days`;
}

/**
 * Assign or reassign a ticket to a support agent (agent-side action). Open
 * tickets move to Assigned; an already-assigned ticket keeps its status. The
 * acting agent is recorded as the actor of the activity event.
 */
export function applyAssignment(
  detail: TicketDetail,
  input: { agentName: string; agentId: string; actorName: string },
  nowIso: string,
): TicketDetail {
  const previous = detail.assignedAgent;
  const isReassign = !!previous && previous !== input.agentName;
  const status = detail.status === "Open" ? "Assigned" : detail.status;

  const label = isReassign
    ? `Reassigned from ${previous} to ${input.agentName}`
    : `Assigned to ${input.agentName}`;

  return {
    ...detail,
    assignedAgent: input.agentName,
    assignedAgentId: input.agentId,
    status,
    updatedAt: nowIso,
    activity: [
      ...detail.activity,
      { id: uid("e"), label, actor: input.actorName, createdAt: nowIso },
    ],
  };
}

/** Append an employee reply. Waiting → In Progress with a routing note. */
export function applyReply(
  detail: TicketDetail,
  input: { bodyHtml: string; attachments: MessageAttachment[] },
  nowIso: string,
): TicketDetail {
  const emp = currentEmployee;
  const message: ConversationMessage = {
    id: uid("m"),
    author: "employee",
    authorName: emp.name,
    authorMeta: emp.role,
    createdAt: nowIso,
    bodyHtml: input.bodyHtml,
    attachments: input.attachments,
  };

  const activity: ActivityEvent[] = [...detail.activity];
  let status = detail.status;

  if (detail.status === "Waiting for Employee") {
    status = "In Progress";
    activity.push({
      id: uid("e"),
      label: "Employee replied and the ticket returned to the support team.",
      actor: emp.name,
      createdAt: nowIso,
    });
  } else {
    activity.push({
      id: uid("e"),
      label: "Employee replied",
      actor: emp.name,
      createdAt: nowIso,
    });
  }

  return {
    ...detail,
    status,
    updatedAt: nowIso,
    messages: [...detail.messages, message],
    activity,
  };
}

/** Employee marks the ticket resolved. */
export function applyResolve(detail: TicketDetail, nowIso: string): TicketDetail {
  return {
    ...detail,
    status: "Resolved",
    resolvedAt: nowIso,
    updatedAt: nowIso,
    activity: [
      ...detail.activity,
      {
        id: uid("e"),
        label: "Ticket marked as resolved by the employee.",
        actor: currentEmployee.name,
        createdAt: nowIso,
      },
    ],
  };
}

/** Employee reopens a resolved ticket with a required reason. */
export function applyReopen(
  detail: TicketDetail,
  input: { reason: string; attachments: MessageAttachment[] },
  nowIso: string,
): TicketDetail {
  const emp = currentEmployee;
  const message: ConversationMessage = {
    id: uid("m"),
    author: "employee",
    authorName: emp.name,
    authorMeta: emp.role,
    createdAt: nowIso,
    bodyHtml: `<p><strong>Reopened:</strong> ${input.reason}</p>`,
    attachments: input.attachments,
  };
  return {
    ...detail,
    status: "In Progress",
    reopenedAt: nowIso,
    updatedAt: nowIso,
    messages: [...detail.messages, message],
    activity: [
      ...detail.activity,
      {
        id: uid("e"),
        label: "Ticket reopened by the employee.",
        actor: emp.name,
        createdAt: nowIso,
      },
    ],
  };
}

/** Employee closes a resolved ticket (permanent). */
export function applyClose(detail: TicketDetail, nowIso: string): TicketDetail {
  return {
    ...detail,
    status: "Closed",
    closedAt: nowIso,
    updatedAt: nowIso,
    activity: [
      ...detail.activity,
      {
        id: uid("e"),
        label: "Ticket closed by the employee.",
        actor: currentEmployee.name,
        createdAt: nowIso,
      },
    ],
  };
}

/**
 * Auto-close a resolved ticket once the reopen window has elapsed. Returns the
 * (possibly unchanged) detail plus whether a transition happened.
 */
export function autoCloseIfExpired(
  detail: TicketDetail,
  nowIso: string,
): { detail: TicketDetail; changed: boolean } {
  if (!reopenWindowEnded(detail, nowIso)) return { detail, changed: false };
  return {
    changed: true,
    detail: {
      ...detail,
      status: "Closed",
      closedAt: nowIso,
      updatedAt: nowIso,
      activity: [
        ...detail.activity,
        {
          id: uid("e"),
          label: `Ticket automatically closed — the ${daysLabel()} reopening period ended.`,
          actor: "System",
          createdAt: nowIso,
        },
      ],
    },
  };
}

/* ---------------------- Agent-side transitions ---------------------------- */

const AGENT_META = "People Operations";

function withAttachmentsVisibility(
  attachments: MessageAttachment[],
  visibility: "public" | "internal",
): MessageAttachment[] {
  return attachments.map((a) => ({ ...a, visibility }));
}

export type ReplyFollowUp = "none" | "wait" | "resolve";

/** Agent posts a public reply, optionally changing status afterwards. */
export function applyAgentReply(
  detail: TicketDetail,
  input: { bodyHtml: string; attachments: MessageAttachment[] },
  followUp: ReplyFollowUp,
  nowIso: string,
): TicketDetail {
  const message: ConversationMessage = {
    id: uid("m"),
    author: "agent",
    authorName: currentAgent.name,
    authorMeta: AGENT_META,
    createdAt: nowIso,
    bodyHtml: input.bodyHtml,
    attachments: withAttachmentsVisibility(input.attachments, "public"),
    visibility: "public",
  };

  const activity: ActivityEvent[] = [
    ...detail.activity,
    { id: uid("e"), label: `${currentAgent.name} replied`, actor: currentAgent.name, createdAt: nowIso },
  ];

  let status = detail.status;
  const patch: Partial<TicketDetail> = {};
  if (followUp === "wait") {
    status = "Waiting for Employee";
    activity.push({
      id: uid("e"),
      label: "Status changed to Waiting for Employee",
      actor: currentAgent.name,
      fromValue: detail.status,
      toValue: "Waiting for Employee",
      createdAt: nowIso,
    });
  } else if (followUp === "resolve") {
    status = "Resolved";
    patch.resolvedAt = nowIso;
    activity.push({
      id: uid("e"),
      label: "Ticket resolved",
      actor: currentAgent.name,
      fromValue: detail.status,
      toValue: "Resolved",
      createdAt: nowIso,
    });
  }

  return { ...detail, ...patch, status, updatedAt: nowIso, messages: [...detail.messages, message], activity };
}

/** Agent adds a support-only internal note (never notifies / reaches the employee). */
export function applyInternalNote(
  detail: TicketDetail,
  input: { bodyHtml: string; attachments: MessageAttachment[] },
  nowIso: string,
): TicketDetail {
  const message: ConversationMessage = {
    id: uid("m"),
    author: "agent",
    authorName: currentAgent.name,
    authorMeta: AGENT_META,
    createdAt: nowIso,
    bodyHtml: input.bodyHtml,
    attachments: withAttachmentsVisibility(input.attachments, "internal"),
    visibility: "internal",
  };
  // Internal notes do not bump the employee-facing updatedAt.
  return {
    ...detail,
    messages: [...detail.messages, message],
    activity: [
      ...detail.activity,
      { id: uid("e"), label: "Internal note added", actor: currentAgent.name, createdAt: nowIso, internal: true },
    ],
  };
}

/** Generic agent status change with optional resolution summary / closing note. */
export function applyStatusChange(
  detail: TicketDetail,
  newStatus: TicketStatus,
  nowIso: string,
  opts?: { resolutionSummary?: string; closingNote?: string },
): TicketDetail {
  const messages = [...detail.messages];
  const activity: ActivityEvent[] = [...detail.activity];
  const patch: Partial<TicketDetail> = {};

  if (newStatus === "Resolved" && opts?.resolutionSummary) {
    messages.push({
      id: uid("m"),
      author: "agent",
      authorName: currentAgent.name,
      authorMeta: AGENT_META,
      createdAt: nowIso,
      bodyHtml: `<p><strong>Resolution:</strong> ${opts.resolutionSummary}</p>`,
      attachments: [],
      visibility: "public",
    });
    patch.resolvedAt = nowIso;
  }
  if (newStatus === "Closed") {
    patch.closedAt = nowIso;
    if (opts?.closingNote) {
      messages.push({
        id: uid("m"),
        author: "agent",
        authorName: currentAgent.name,
        authorMeta: AGENT_META,
        createdAt: nowIso,
        bodyHtml: `<p><strong>Closing note:</strong> ${opts.closingNote}</p>`,
        attachments: [],
        visibility: "public",
      });
    }
  }
  if (newStatus === "In Progress" && detail.status === "Resolved") {
    patch.reopenedAt = nowIso;
  }

  activity.push({
    id: uid("e"),
    label: `Status changed from ${detail.status} to ${newStatus}`,
    actor: currentAgent.name,
    fromValue: detail.status,
    toValue: newStatus,
    createdAt: nowIso,
  });

  return { ...detail, ...patch, status: newStatus, updatedAt: nowIso, messages, activity };
}

/** Agent changes priority (recalc of SLA happens downstream from priority). */
export function applyPriorityChange(
  detail: TicketDetail,
  newPriority: TicketPriority,
  nowIso: string,
  reason?: string,
): TicketDetail {
  const activity: ActivityEvent[] = [
    ...detail.activity,
    {
      id: uid("e"),
      label: `Priority changed from ${detail.priority} to ${newPriority}`,
      actor: currentAgent.name,
      fromValue: detail.priority,
      toValue: newPriority,
      createdAt: nowIso,
    },
  ];
  if (newPriority === "Critical" && reason) {
    activity.push({
      id: uid("e"),
      label: `Critical priority reason: ${reason}`,
      actor: currentAgent.name,
      createdAt: nowIso,
      internal: true,
    });
  }
  return { ...detail, priority: newPriority, updatedAt: nowIso, activity };
}

/** Escalate the ticket (internal). Does not change priority. */
export function applyEscalate(
  detail: TicketDetail,
  input: { target: string; reason: string; note?: string },
  nowIso: string,
): TicketDetail {
  const activity: ActivityEvent[] = [
    ...detail.activity,
    {
      id: uid("e"),
      label: `Ticket escalated to ${input.target}`,
      actor: currentAgent.name,
      createdAt: nowIso,
      internal: true,
    },
  ];
  if (input.note) {
    activity.push({
      id: uid("e"),
      label: `Escalation note: ${input.note}`,
      actor: currentAgent.name,
      createdAt: nowIso,
      internal: true,
    });
  }
  return {
    ...detail,
    escalated: true,
    escalation: { target: input.target, reason: input.reason, note: input.note, at: nowIso },
    updatedAt: nowIso,
    activity,
  };
}

/**
 * Prototype merge rule (exact backend behaviour pending dev confirmation):
 * the primary stays active and absorbs the duplicate's public messages behind a
 * separator; the duplicate is closed and points at the primary.
 */
export function applyMerge(
  primary: TicketDetail,
  duplicate: TicketDetail,
  nowIso: string,
): { primary: TicketDetail; duplicate: TicketDetail } {
  const publicFromDup = duplicate.messages.filter((m) => m.visibility !== "internal");
  const separator: ConversationMessage = {
    id: uid("m"),
    author: "agent",
    authorName: "System",
    authorMeta: "Merge",
    createdAt: nowIso,
    bodyHtml: `<p><em>— Merged from ${duplicate.id}: ${duplicate.subject} —</em></p>`,
    attachments: [],
    visibility: "public",
  };

  const nextPrimary: TicketDetail = {
    ...primary,
    mergedTicketIds: [...(primary.mergedTicketIds ?? []), duplicate.id],
    updatedAt: nowIso,
    messages: [...primary.messages, separator, ...publicFromDup],
    activity: [
      ...primary.activity,
      {
        id: uid("e"),
        label: `Ticket ${duplicate.id} merged into this ticket`,
        actor: currentAgent.name,
        createdAt: nowIso,
      },
    ],
  };

  const nextDuplicate: TicketDetail = {
    ...duplicate,
    status: "Closed",
    closedAt: nowIso,
    mergedIntoTicketId: primary.id,
    updatedAt: nowIso,
    activity: [
      ...duplicate.activity,
      {
        id: uid("e"),
        label: `Ticket merged into ${primary.id} and closed`,
        actor: currentAgent.name,
        createdAt: nowIso,
      },
    ],
  };

  return { primary: nextPrimary, duplicate: nextDuplicate };
}

/** Reassign a ticket to a different team (admin config action). Unassigns the agent. */
export function applyReassignTeam(
  detail: TicketDetail,
  input: { newTeam: string; actorName: string; reason?: string },
  nowIso: string,
): TicketDetail {
  return {
    ...detail,
    assignedTeam: input.newTeam,
    assignedAgent: null,
    assignedAgentId: null,
    updatedAt: nowIso,
    activity: [
      ...detail.activity,
      {
        id: uid("e"),
        label: `Ticket reassigned to ${input.newTeam}${input.reason ? ` (${input.reason})` : ""}`,
        actor: input.actorName,
        fromValue: detail.assignedTeam,
        toValue: input.newTeam,
        createdAt: nowIso,
      },
    ],
  };
}

/** Agent status transition options per current status. */
export function allowedTransitions(status: TicketStatus): TicketStatus[] {
  switch (status) {
    case "Open":
      return ["Assigned", "In Progress", "Closed"];
    case "Assigned":
      return ["In Progress", "Waiting for Employee", "Resolved", "Closed"];
    case "In Progress":
      return ["Waiting for Employee", "Resolved", "Closed"];
    case "Waiting for Employee":
      return ["In Progress", "Resolved", "Closed"];
    case "Resolved":
      return ["In Progress", "Closed"];
    case "Closed":
    default:
      return [];
  }
}
