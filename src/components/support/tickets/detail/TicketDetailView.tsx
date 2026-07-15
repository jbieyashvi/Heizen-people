"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CircleCheck,
  RotateCcw,
  XCircle,
  TriangleAlert,
  Lock,
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import type { TicketDetail } from "@/lib/types";
import { useTicketDetail } from "@/lib/support/useTicketDetail";
import { getPermissions } from "@/lib/support/statusTransitions";
import { ConversationThread } from "./ConversationThread";
import { ReplyComposer } from "./ReplyComposer";
import { AttachmentsPanel } from "./AttachmentsPanel";
import { TicketMetaSidebar } from "./TicketMetaSidebar";
import { ActivityTimeline } from "./ActivityTimeline";
import { TicketStatusProgress } from "./TicketStatusProgress";
import { TicketNotFound } from "./TicketNotFound";
import { ConfirmDialog } from "./ConfirmDialog";
import { ReopenDialog } from "./ReopenDialog";
import { Toast } from "./Toast";

function Card({
  title,
  action,
  children,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
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

function DetailSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-5">
      <div className="h-3 w-40 rounded bg-slate-100" />
      <div className="h-6 w-72 rounded bg-slate-100" />
      <div className="h-16 rounded-lg bg-slate-100" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="h-72 rounded-lg bg-slate-100 lg:col-span-2" />
        <div className="h-72 rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}

const secondaryBtn =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400";
const primaryBtn =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-heizen-500 px-3.5 text-sm font-medium text-white outline-none transition-colors hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-2";

export function TicketDetailView({ ticketId }: { ticketId: string }) {
  const { detail, state, reload, reply, resolve, reopen, close } = useTicketDetail(ticketId);
  const [toast, setToast] = useState<string | null>(null);
  const [dialog, setDialog] = useState<"resolve" | "reopen" | "close" | null>(null);

  if (state === "loading") return <DetailSkeleton />;

  if (state === "notfound") {
    return (
      <div className="flex flex-col gap-5">
        <Breadcrumb
          items={[
            { label: "Support Center", href: "/support" },
            { label: "My Tickets", href: "/support/tickets" },
            { label: ticketId },
          ]}
        />
        <TicketNotFound />
      </div>
    );
  }

  if (state === "error" || !detail) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-[#DDE1E4] bg-white px-6 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600">
          <TriangleAlert className="h-6 w-6" strokeWidth={1.5} aria-hidden />
        </span>
        <div className="max-w-md">
          <h2 className="text-base font-semibold text-slate-800">We couldn&rsquo;t load this ticket</h2>
          <p className="mt-1.5 text-sm text-slate-500">Something went wrong. Please try again.</p>
        </div>
        <button type="button" onClick={reload} className={secondaryBtn}>
          <RotateCcw className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden />
          Retry
        </button>
      </div>
    );
  }

  const now = new Date().toISOString();
  const perms = getPermissions(detail, now);

  // Employees never see support-only internal notes / activity / attachments.
  const publicMessages = detail.messages.filter((m) => m.visibility !== "internal");
  const publicActivity = detail.activity.filter((a) => !a.internal);
  const publicDetail = { ...detail, messages: publicMessages, activity: publicActivity };

  function handleReply(input: { bodyHtml: string; attachments: TicketDetail["messages"][number]["attachments"] }) {
    const wasWaiting = detail?.status === "Waiting for Employee";
    reply(input);
    setToast(wasWaiting ? "Reply sent — ticket returned to the support team." : "Reply sent.");
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Breadcrumb
          items={[
            { label: "Support Center", href: "/support" },
            { label: "My Tickets", href: "/support/tickets" },
            { label: detail.id },
          ]}
        />
        <Link href="/support/tickets" className="inline-flex w-fit items-center gap-1.5 rounded-md text-sm font-medium text-slate-500 outline-none hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-heizen-400">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Back to My Tickets
        </Link>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-xs font-medium text-slate-400">{detail.id}</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">{detail.subject}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={detail.status} />
              <PriorityBadge priority={detail.priority} />
            </div>
          </div>

          {/* Primary actions — visible, not hidden in an overflow menu */}
          <div className="flex flex-wrap gap-2">
            {perms.canMarkResolved && (
              <button type="button" onClick={() => setDialog("resolve")} className={primaryBtn}>
                <CircleCheck className="h-4 w-4" strokeWidth={2} aria-hidden />
                Mark as Resolved
              </button>
            )}
            {perms.canReopen && (
              <button type="button" onClick={() => setDialog("reopen")} className={secondaryBtn}>
                <RotateCcw className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden />
                Reopen Ticket
              </button>
            )}
            {perms.canClose && (
              <button type="button" onClick={() => setDialog("close")} className={secondaryBtn}>
                <XCircle className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden />
                Close Ticket
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status progress */}
      <Card>
        <TicketStatusProgress detail={detail} />
      </Card>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left: conversation + composer + attachments */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          <Card title="Conversation">
            <ConversationThread messages={publicMessages} />
          </Card>

          {/* Reply / status-specific composer area */}
          {perms.canReply ? (
            <Card title="Reply">
              <ReplyComposer onSend={handleReply} />
            </Card>
          ) : perms.isClosed ? (
            <div className="flex items-center gap-2.5 rounded-lg border border-[#EAECEE] bg-surface-muted px-4 py-3">
              <Lock className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.75} aria-hidden />
              <p className="text-sm text-slate-500">
                This ticket is closed and can no longer be updated.
              </p>
            </div>
          ) : (
            <Card title="This ticket is resolved">
              <p className="text-sm text-slate-500">
                If your request has been addressed, you can close this ticket. If you still need
                help, reopen it within seven days.
              </p>
              {!perms.canReopen && (
                <p className="text-sm font-medium text-amber-700">
                  The seven-day reopening period has ended.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {perms.canReopen && (
                  <button type="button" onClick={() => setDialog("reopen")} className={secondaryBtn}>
                    <RotateCcw className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden />
                    Reopen Ticket
                  </button>
                )}
                {perms.canClose && (
                  <button type="button" onClick={() => setDialog("close")} className={secondaryBtn}>
                    <XCircle className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden />
                    Close Ticket
                  </button>
                )}
              </div>
            </Card>
          )}

          <Card title="Attachments">
            <AttachmentsPanel detail={publicDetail} />
          </Card>
        </div>

        {/* Right: details + activity */}
        <div className="flex flex-col gap-5 lg:col-span-1">
          <Card title="Ticket details">
            <TicketMetaSidebar detail={detail} />
          </Card>
          <Card title="Activity">
            <ActivityTimeline events={publicActivity} />
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={dialog === "resolve"}
        icon={CircleCheck}
        tone="primary"
        title="Mark this ticket as resolved?"
        message="Use this when your request has been addressed. You can reopen the ticket within seven days."
        confirmLabel="Mark as Resolved"
        onCancel={() => setDialog(null)}
        onConfirm={() => {
          resolve();
          setDialog(null);
          setToast("Ticket marked as resolved.");
        }}
      />

      <ConfirmDialog
        open={dialog === "close"}
        icon={XCircle}
        tone="danger"
        title="Close this ticket?"
        message="A closed ticket cannot be reopened. Are you sure you want to close it?"
        confirmLabel="Close Ticket"
        onCancel={() => setDialog(null)}
        onConfirm={() => {
          close();
          setDialog(null);
          setToast("Ticket closed.");
        }}
      />

      <ReopenDialog
        open={dialog === "reopen"}
        onCancel={() => setDialog(null)}
        onReopen={(input) => {
          reopen(input);
          setDialog(null);
          setToast("Ticket reopened.");
        }}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
