import type {
  MessageAttachment,
  SeedTicket,
  StoredTicket,
  TicketDetail,
  TicketRecord,
  TicketStatus,
} from "@/lib/types";
import { seedTickets } from "@/lib/data/seedTickets";
import { buildInitialDetail } from "@/lib/data/ticketThreads";
import { currentEmployee } from "@/lib/data/employee";
import { agentIdForName } from "@/lib/agent/team";
import {
  getDetailOverrides,
  getStoredDetails,
  getStoredTickets,
  type DetailOverride,
} from "@/lib/store/ticketStore";

/** Deterministic, stable employee id from a name (mock — no real directory). */
export function employeeIdFor(name: string): string {
  if (name === currentEmployee.name) return currentEmployee.id;
  let sum = 0;
  for (let i = 0; i < name.length; i += 1) sum += name.charCodeAt(i);
  return `HEZ-${2000 + (sum % 7000)}`;
}

/** Resolution/closed timestamps inferred from a seed's terminal status. */
function terminalTimes(status: TicketStatus, updatedAt: string): { resolvedAt?: string; closedAt?: string } {
  if (status === "Resolved") return { resolvedAt: updatedAt };
  if (status === "Closed") return { resolvedAt: updatedAt, closedAt: updatedAt };
  return {};
}

/** Map a seeded ticket to the normalised record shape (derives agent-facing fields). */
function mapSeedToRecord(seed: SeedTicket): TicketRecord {
  return {
    id: seed.id,
    subject: seed.subject,
    category: seed.category,
    priority: seed.priority,
    assignedTeam: seed.assignedTeam,
    status: seed.status,
    createdAt: seed.createdAt,
    updatedAt: seed.updatedAt,
    lastActivityAt: seed.updatedAt,
    ...terminalTimes(seed.status, seed.updatedAt),
    employeeName: seed.employeeName,
    employeeId: employeeIdFor(seed.employeeName),
    employeeDepartment: seed.employeeDepartment,
    assignedAgent: seed.assignedAgent,
    assignedAgentId: agentIdForName(seed.assignedAgent),
  };
}

/** Map a locally-stored (form-submitted) ticket to the normalised record shape. */
export function mapStoredToRecord(ticket: StoredTicket): TicketRecord {
  return {
    id: ticket.id,
    subject: ticket.subject,
    category: ticket.categoryLabel,
    priority: ticket.priority,
    assignedTeam: ticket.assignedTeam,
    status: ticket.status,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    lastActivityAt: ticket.updatedAt,
    // Form-submitted tickets belong to the signed-in employee and start unassigned.
    employeeName: currentEmployee.name,
    employeeId: currentEmployee.id,
    employeeDepartment: currentEmployee.department,
    assignedAgent: null,
    assignedAgentId: null,
  };
}

type Overrides = Record<string, DetailOverride>;

/**
 * Combine seeded tickets with stored (form-submitted) ones, then overlay any
 * status / assignment / resolution changes persisted on the details page or via
 * assignment. Stored tickets win on id collisions; overrides win on the fields
 * they carry. Ordered newest-updated first.
 */
export function mergeTickets(stored: StoredTicket[], overrides: Overrides = {}): TicketRecord[] {
  const byId = new Map<string, TicketRecord>();

  for (const seed of seedTickets) byId.set(seed.id, mapSeedToRecord(seed));
  for (const ticket of stored) byId.set(ticket.id, mapStoredToRecord(ticket));

  for (const [id, o] of Object.entries(overrides)) {
    const base = byId.get(id);
    if (!base) continue;
    byId.set(id, {
      ...base,
      status: o.status,
      updatedAt: o.updatedAt,
      lastActivityAt: o.updatedAt,
      priority: o.priority ?? base.priority,
      assignedTeam: o.assignedTeam ?? base.assignedTeam,
      // Newer persisted details carry these; older ones fall back to the base.
      assignedAgent: o.assignedAgent !== undefined ? o.assignedAgent : base.assignedAgent,
      assignedAgentId:
        o.assignedAgentId !== undefined ? o.assignedAgentId : base.assignedAgentId,
      resolvedAt: o.resolvedAt ?? base.resolvedAt,
      closedAt: o.closedAt ?? base.closedAt,
    });
  }

  return [...byId.values()].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

/** Read all combined records with detail overrides applied. */
export function getAllTicketRecords(): TicketRecord[] {
  return mergeTickets(getStoredTickets(), getDetailOverrides());
}

/** Records owned by a specific employee (employee-scoped views). */
export function getEmployeeTicketRecords(employeeName: string): TicketRecord[] {
  return getAllTicketRecords().filter((t) => t.employeeName === employeeName);
}

/** Records routed to a specific support team (agent-scoped views). */
export function getTeamTicketRecords(team: string): TicketRecord[] {
  return getAllTicketRecords().filter((t) => t.assignedTeam === team);
}

/** A single combined record by id, or null. */
export function getTicketRecord(id: string): TicketRecord | null {
  return getAllTicketRecords().find((t) => t.id === id) ?? null;
}

/**
 * Merge candidates for a ticket: same employee, same (People Operations) team,
 * not the current ticket, and not Closed.
 */
export function getMergeCandidates(
  employeeName: string,
  currentId: string,
  team: string,
): TicketRecord[] {
  return getAllTicketRecords().filter(
    (t) =>
      t.id !== currentId &&
      t.employeeName === employeeName &&
      t.assignedTeam === team &&
      t.status !== "Closed",
  );
}

function mockAttachments(id: string, count: number): MessageAttachment[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${id}-a${i + 1}`,
    name: `attachment-${i + 1}.pdf`,
    size: 128_000,
  }));
}

/**
 * Resolve the full detail for a ticket id. Prefers persisted detail; otherwise
 * builds a deterministic initial detail from the seed or stored ticket (acts as
 * the migration layer for older tickets). Returns null when the id is unknown.
 */
export function getTicketDetail(id: string): TicketDetail | null {
  // 1. Persisted detail (has replies / status changes).
  const persisted = getStoredDetails()[id];
  if (persisted) return persisted;

  // 2. Form-submitted ticket.
  const stored = getStoredTickets().find((t) => t.id === id);
  if (stored) {
    return buildInitialDetail({
      id: stored.id,
      subject: stored.subject,
      category: stored.categoryLabel,
      requestType: stored.requestType,
      priority: stored.priority,
      assignedTeam: stored.assignedTeam,
      assignedAgent: null,
      assignedAgentId: null,
      status: stored.status,
      createdAt: stored.createdAt,
      updatedAt: stored.updatedAt,
      descriptionHtml: stored.descriptionHtml,
      attachments: mockAttachments(stored.id, stored.attachmentCount),
    });
  }

  // 3. Seeded ticket.
  const seed = seedTickets.find((t) => t.id === id);
  if (seed) {
    return buildInitialDetail({
      id: seed.id,
      subject: seed.subject,
      category: seed.category,
      requestType: seed.requestType,
      priority: seed.priority,
      assignedTeam: seed.assignedTeam,
      assignedAgent: seed.assignedAgent,
      assignedAgentId: agentIdForName(seed.assignedAgent),
      status: seed.status,
      createdAt: seed.createdAt,
      updatedAt: seed.updatedAt,
      descriptionHtml: `<p>${seed.description}</p>`,
      attachments: seed.attachments ?? [],
    });
  }

  return null;
}
