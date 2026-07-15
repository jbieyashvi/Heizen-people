"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, FileQuestion, TriangleAlert, RotateCcw, GitMerge } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import type { MessageAttachment, TicketPriority, TicketStatus } from "@/lib/types";
import type { ReplyFollowUp } from "@/lib/support/statusTransitions";
import { useAgentTicketDetail } from "@/lib/agent/useAgentTicketDetail";
import { getTicketRecord, getMergeCandidates } from "@/lib/support/ticketService";
import { getAgentTickets, buildAgentTicket, computeTeamWorkload } from "@/lib/agent/agentTickets";
import { computeSla } from "@/lib/agent/sla";
import { AGENT_TEAM } from "@/lib/roles/roles";
import { Toast } from "@/components/support/tickets/detail/Toast";
import { AssignmentModal } from "@/components/agent/queue/AssignmentModal";
import { AgentDetailHeader } from "@/components/agent/detail/AgentDetailHeader";
import { ConversationPanel } from "@/components/agent/detail/ConversationPanel";
import { AgentAttachmentsPanel } from "@/components/agent/detail/AgentAttachmentsPanel";
import { AgentActivityLog } from "@/components/agent/detail/AgentActivityLog";
import { SlaPanel } from "@/components/agent/detail/SlaPanel";
import { TicketInfoPanel, EmployeeInfoPanel, AssignmentDetailsPanel, RelatedMergedPanel } from "@/components/agent/detail/SidebarPanels";
import { ChangeStatusDialog } from "@/components/agent/detail/ChangeStatusDialog";
import { PriorityDialog } from "@/components/agent/detail/PriorityDialog";
import { EscalateModal } from "@/components/agent/detail/EscalateModal";
import { MergeModal } from "@/components/agent/detail/MergeModal";

function Card({ title, action, children }: { title?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-[#EAECEE] bg-white p-4">
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

type DialogKind = "assign" | "status" | "priority" | "escalate" | "merge" | null;

interface AgentTicketDetailViewProps {
  ticketId: string;
  /** Admin org-wide access — bypasses the team permission check. */
  orgWide?: boolean;
  backHref?: string;
  overviewHref?: string;
}

export function AgentTicketDetailView({
  ticketId,
  orgWide = false,
  backHref = "/agent/tickets?queue=all",
  overviewHref = "/agent/dashboard",
}: AgentTicketDetailViewProps) {
  const { detail, state, now, reload, reply, addNote, changeStatus, changePriority, assign, escalate, merge } =
    useAgentTicketDetail(ticketId, { orgWide });
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Read fresh each render so record/workloads reflect the latest persisted state.
  const record = getTicketRecord(ticketId);
  const agentTickets = getAgentTickets(AGENT_TEAM, now);
  const workloads = computeTeamWorkload(agentTickets);

  if (state === "loading") {
    return (
      <div className="flex animate-pulse flex-col gap-5">
        <div className="h-3 w-48 rounded bg-slate-100" />
        <div className="h-6 w-80 rounded bg-slate-100" />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="h-96 rounded-lg bg-slate-100 lg:col-span-2" />
          <div className="h-96 rounded-lg bg-slate-100" />
        </div>
      </div>
    );
  }

  if (state === "notfound") {
    return (
      <div className="flex flex-col gap-5">
        <Breadcrumb items={[{ label: "Support", href: overviewHref }, { label: "Tickets", href: backHref }, { label: ticketId }]} />
        <StateBox icon={FileQuestion} title="Ticket not found" note="We couldn't find a ticket with that ID." backHref={backHref} />
      </div>
    );
  }

  // Access denied — never expose employee messages / attachments / private info.
  if (state === "denied") {
    return (
      <div className="flex flex-col gap-5">
        <Breadcrumb items={[{ label: "Support", href: overviewHref }, { label: "Tickets", href: backHref }, { label: ticketId }]} />
        <StateBox
          icon={ShieldAlert}
          tone="danger"
          title="Access denied"
          note="This ticket belongs to another support team. As a People Operations agent you can only view People Operations tickets."
          backHref={backHref}
        />
      </div>
    );
  }

  if (state === "error" || !detail || !record) {
    return (
      <div className="flex flex-col gap-5">
        <StateBox icon={TriangleAlert} tone="warning" title="We couldn't load this ticket" note="Something went wrong. Please try again." onRetry={reload} backHref={backHref} />
      </div>
    );
  }

  const sla = computeSla(detail, now);
  const closed = detail.status === "Closed";
  const isMerged = !!detail.mergedIntoTicketId;
  const assignAgentTicket = buildAgentTicket(record, now);
  const mergeCandidates = getMergeCandidates(record.employeeName, record.id, AGENT_TEAM);
  const myWorkload = workloads.find((w) => w.name === detail.assignedAgent);
  const workloadLabel = myWorkload ? `${myWorkload.active} active · ${myWorkload.dueSoon} due soon` : "—";

  function handleReply(input: { bodyHtml: string; attachments: MessageAttachment[] }, followUp: ReplyFollowUp) {
    reply(input, followUp);
    setToast(followUp === "wait" ? "Reply sent — waiting for employee." : followUp === "resolve" ? "Reply sent — ticket resolved." : "Reply sent to the employee.");
  }

  return (
    <div className="flex flex-col gap-5">
      <AgentDetailHeader
        detail={detail}
        sla={sla}
        backHref={backHref}
        overviewHref={overviewHref}
        closed={closed}
        onAssign={() => setDialog("assign")}
        onChangeStatus={() => setDialog("status")}
        onChangePriority={() => setDialog("priority")}
        onEscalate={() => setDialog("escalate")}
        onMerge={() => setDialog("merge")}
      />

      {isMerged && (
        <div className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-amber-800">
            <GitMerge className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            This ticket was merged into <span className="font-mono font-semibold">{detail.mergedIntoTicketId}</span>
          </p>
          <Link href={`/agent/tickets/${detail.mergedIntoTicketId}`} className="inline-flex h-8 w-fit items-center gap-1.5 rounded-md bg-amber-500 px-3 text-xs font-medium text-white outline-none hover:bg-amber-600 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2">
            View Primary Ticket
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left main */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          <ConversationPanel detail={detail} closed={closed} onReply={handleReply} onNote={(input) => { addNote(input); setToast("Internal note added."); }} />
          <Card title="Attachments">
            <AgentAttachmentsPanel detail={detail} />
          </Card>
          <Card title="Activity Log">
            <AgentActivityLog events={detail.activity} />
          </Card>
        </div>

        {/* Right sticky sidebar */}
        <div className="lg:col-span-1">
          <div className="flex flex-col gap-5 lg:sticky lg:top-20">
            <Card title="SLA">
              <SlaPanel detail={detail} now={now} />
            </Card>
            <Card title="Ticket information">
              <TicketInfoPanel detail={detail} />
            </Card>
            <Card title="Employee information">
              <EmployeeInfoPanel record={record} />
            </Card>
            <Card title="Assignment">
              <AssignmentDetailsPanel detail={detail} workloadLabel={workloadLabel} onManage={() => setDialog("assign")} />
            </Card>
            <Card title="Related / Merged tickets">
              <RelatedMergedPanel detail={detail} />
            </Card>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <AssignmentModal
        open={dialog === "assign"}
        ticket={dialog === "assign" ? assignAgentTicket : null}
        workloads={workloads}
        onCancel={() => setDialog(null)}
        onConfirm={(name, id) => { assign(name, id); setDialog(null); setToast(`Assigned to ${name}.`); }}
      />
      <ChangeStatusDialog
        open={dialog === "status"}
        currentStatus={detail.status}
        onClose={() => setDialog(null)}
        onConfirm={(status: TicketStatus, opts) => { changeStatus(status, opts); setDialog(null); setToast(`Status changed to ${status}.`); }}
      />
      <PriorityDialog
        open={dialog === "priority"}
        currentPriority={detail.priority}
        onClose={() => setDialog(null)}
        onConfirm={(priority: TicketPriority, reason) => { changePriority(priority, reason); setDialog(null); setToast(`Priority set to ${priority}.`); }}
      />
      <EscalateModal
        open={dialog === "escalate"}
        currentPriority={detail.priority}
        onClose={() => setDialog(null)}
        onConfirm={(input) => { escalate(input); setDialog(null); setToast(`Escalated to ${input.target}.`); }}
      />
      <MergeModal
        open={dialog === "merge"}
        primaryId={detail.id}
        candidates={mergeCandidates}
        onClose={() => setDialog(null)}
        onConfirm={(dupId) => { merge(dupId); setDialog(null); setToast(`Merged ${dupId} into this ticket.`); }}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

function StateBox({ icon: Icon, title, note, tone = "neutral", onRetry, backHref }: { icon: typeof FileQuestion; title: string; note: string; tone?: "neutral" | "danger" | "warning"; onRetry?: () => void; backHref: string }) {
  const badge = tone === "danger" ? "border-red-200 bg-red-50 text-red-600" : tone === "warning" ? "border-amber-200 bg-amber-50 text-amber-600" : "border-[#EAECEE] bg-surface-muted text-slate-400";
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-[#DDE1E4] bg-white px-6 py-16 text-center">
      <span className={`flex h-12 w-12 items-center justify-center rounded-lg border ${badge}`}>
        <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
      </span>
      <div className="max-w-md">
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        <p className="mt-1.5 text-sm text-slate-500">{note}</p>
      </div>
      <div className="flex gap-2.5">
        <Link href={backHref} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400">
          <ArrowLeft className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden />
          Back to Ticket Queues
        </Link>
        {onRetry && (
          <button type="button" onClick={onRetry} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400">
            <RotateCcw className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
