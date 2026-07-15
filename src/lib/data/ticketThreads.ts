import type {
  ActivityEvent,
  ConversationMessage,
  MessageAttachment,
  TicketDetail,
  TicketPriority,
  TicketStatus,
} from "@/lib/types";
import { currentEmployee } from "@/lib/data/employee";

/** Support agent identities per routed team (mock). */
const AGENTS: Record<string, { name: string; meta: string }> = {
  "Payroll Team": { name: "Nisha Rao", meta: "Payroll Support" },
  "IT Team": { name: "Rahul Verma", meta: "IT Support" },
  "People Operations": { name: "Priya Nair", meta: "People Operations" },
  Administration: { name: "Karan Shah", meta: "Administration" },
  "Compliance Team": { name: "Meera Iyer", meta: "Compliance" },
};

function agentFor(team: string): { name: string; meta: string } {
  return AGENTS[team] ?? { name: "Support Agent", meta: team };
}

/** Interpolate an ISO timestamp between two bounds. */
function lerpIso(startIso: string, endIso: string, frac: number): string {
  const s = new Date(startIso).getTime();
  const e = new Date(endIso).getTime();
  const t = Number.isNaN(e) || e <= s ? s + frac * 60_000 : s + (e - s) * frac;
  return new Date(t).toISOString();
}

export interface BuildDetailInput {
  id: string;
  subject: string;
  category: string;
  requestType: string;
  priority: TicketPriority;
  assignedTeam: string;
  assignedAgent: string | null;
  assignedAgentId: string | null;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  descriptionHtml: string;
  attachments: MessageAttachment[];
}

/**
 * Deterministically build the full conversation + activity for a ticket from its
 * scalar fields. Ids derive from the ticket id so re-derivation across refreshes
 * is stable (no duplicates). Timestamps interpolate between created/updated.
 */
export function buildInitialDetail(input: BuildDetailInput): TicketDetail {
  const { id, status, assignedTeam, createdAt, updatedAt } = input;
  const agent = agentFor(assignedTeam);
  const emp = currentEmployee;

  const messages: ConversationMessage[] = [];
  const activity: ActivityEvent[] = [];

  // 1. Employee submission — always present.
  messages.push({
    id: `${id}-m1`,
    author: "employee",
    authorName: emp.name,
    authorMeta: emp.role,
    createdAt,
    bodyHtml: input.descriptionHtml,
    attachments: input.attachments,
  });
  activity.push({
    id: `${id}-e1`,
    label: "Ticket created",
    actor: emp.name,
    createdAt,
  });

  const reached = (...list: TicketStatus[]) => list.includes(status);
  const agentEngaged = reached("In Progress", "Waiting for Employee", "Resolved", "Closed");
  const isAssignedOrBeyond = status !== "Open";

  if (isAssignedOrBeyond) {
    activity.push({
      id: `${id}-e2`,
      label: `Assigned to ${assignedTeam}`,
      actor: "System",
      createdAt: lerpIso(createdAt, updatedAt, 0.15),
    });
    activity.push({
      id: `${id}-e3`,
      label: "Status changed from Open to Assigned",
      actor: "System",
      createdAt: lerpIso(createdAt, updatedAt, 0.16),
    });
  }

  if (agentEngaged) {
    messages.push({
      id: `${id}-m2`,
      author: "agent",
      authorName: agent.name,
      authorMeta: agent.meta,
      createdAt: lerpIso(createdAt, updatedAt, 0.35),
      bodyHtml:
        "<p>Thanks for reaching out — I&rsquo;ve picked this up and I&rsquo;m looking into it now. I&rsquo;ll keep you posted here.</p>",
      attachments: [],
    });
    activity.push({
      id: `${id}-e4`,
      label: `${agent.name} replied`,
      actor: agent.name,
      createdAt: lerpIso(createdAt, updatedAt, 0.35),
    });
    activity.push({
      id: `${id}-e5`,
      label: "Status changed to In Progress",
      actor: "System",
      createdAt: lerpIso(createdAt, updatedAt, 0.36),
    });

    // Example internal note (support-only) for People Operations tickets.
    if (input.assignedTeam === "People Operations") {
      const notes = [
        "Need Payroll confirmation before responding.",
        "Waiting for leadership approval.",
        "Potential duplicate of HSC-2026-000322.",
      ];
      const digits = id.match(/(\d+)$/);
      const note = notes[(digits ? Number.parseInt(digits[1], 10) : 0) % notes.length];
      messages.push({
        id: `${id}-n1`,
        author: "agent",
        authorName: agent.name,
        authorMeta: agent.meta,
        createdAt: lerpIso(createdAt, updatedAt, 0.45),
        bodyHtml: `<p>${note}</p>`,
        attachments: [],
        visibility: "internal",
      });
      activity.push({
        id: `${id}-en1`,
        label: "Internal note added",
        actor: agent.name,
        createdAt: lerpIso(createdAt, updatedAt, 0.45),
        internal: true,
      });
    }
  }

  if (status === "Waiting for Employee") {
    messages.push({
      id: `${id}-m3`,
      author: "agent",
      authorName: agent.name,
      authorMeta: agent.meta,
      createdAt: lerpIso(createdAt, updatedAt, 0.6),
      bodyHtml:
        "<p>To move this forward we need a little more information from you. Could you confirm the details and share anything relevant? Once we have that, we&rsquo;ll continue.</p>",
      attachments: [],
    });
    activity.push({
      id: `${id}-e6`,
      label: "Status changed to Waiting for Employee",
      actor: agent.name,
      createdAt: lerpIso(createdAt, updatedAt, 0.6),
    });
  }

  if (reached("Resolved", "Closed")) {
    messages.push({
      id: `${id}-m4`,
      author: "agent",
      authorName: agent.name,
      authorMeta: agent.meta,
      createdAt: lerpIso(createdAt, updatedAt, 0.85),
      bodyHtml:
        "<p>This has now been addressed and resolved. Please review and let us know if anything else is needed — you can reopen this ticket within seven days if required.</p>",
      attachments: [],
    });
    activity.push({
      id: `${id}-e7`,
      label: "Ticket resolved",
      actor: agent.name,
      createdAt: lerpIso(createdAt, updatedAt, status === "Closed" ? 0.85 : 1),
    });
  }

  if (status === "Closed") {
    activity.push({
      id: `${id}-e8`,
      label: "Ticket closed",
      actor: "System",
      createdAt: updatedAt,
    });
  }

  const detail: TicketDetail = {
    id,
    subject: input.subject,
    category: input.category,
    requestType: input.requestType,
    priority: input.priority,
    assignedTeam,
    assignedAgent: input.assignedAgent,
    assignedAgentId: input.assignedAgentId,
    status,
    createdAt,
    updatedAt,
    messages,
    activity,
  };

  if (reached("Resolved", "Closed")) {
    detail.resolvedAt = lerpIso(createdAt, updatedAt, status === "Closed" ? 0.85 : 1);
  }
  if (status === "Closed") detail.closedAt = updatedAt;

  return detail;
}
