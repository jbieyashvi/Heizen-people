"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, UserCog, GitPullRequestArrow, MoreHorizontal, Flag, Merge, Gauge, ShieldAlert } from "lucide-react";
import type { SlaInfo, TicketDetail } from "@/lib/types";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { SlaBadge } from "@/components/agent/SlaBadge";

interface AgentDetailHeaderProps {
  detail: TicketDetail;
  sla: SlaInfo;
  backHref: string;
  overviewHref?: string;
  closed: boolean;
  onAssign: () => void;
  onChangeStatus: () => void;
  onChangePriority: () => void;
  onEscalate: () => void;
  onMerge: () => void;
}

const primaryBtn = "inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-heizen-500 px-3.5 text-sm font-medium text-white outline-none transition-colors hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400";
const secondaryBtn = "inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400 disabled:cursor-not-allowed disabled:opacity-50";

export function AgentDetailHeader({ detail, sla, backHref, overviewHref = "/agent/dashboard", closed, onAssign, onChangeStatus, onChangePriority, onEscalate, onMerge }: AgentDetailHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const menuItem = "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-600 outline-none hover:bg-slate-50 focus-visible:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex flex-col gap-3">
      <Breadcrumb items={[{ label: "Support", href: overviewHref }, { label: "Tickets", href: backHref }, { label: detail.id }]} />
      <Link href={backHref} className="inline-flex w-fit items-center gap-1.5 rounded-md text-sm font-medium text-slate-500 outline-none hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-heizen-400">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        Back to Ticket Queue
      </Link>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-xs font-medium text-slate-400">{detail.id}</p>
            {detail.escalated && (
              <span className="inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">
                <ShieldAlert className="h-3 w-3" strokeWidth={2} aria-hidden />
                Escalated
              </span>
            )}
          </div>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">{detail.subject}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={detail.status} label={detail.status} />
            <PriorityBadge priority={detail.priority} />
            <SlaBadge sla={sla} />
          </div>
        </div>

        {/* Primary actions kept visible */}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onAssign} disabled={closed} className={secondaryBtn}>
            <UserCog className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden />
            {detail.assignedAgent ? "Reassign" : "Assign"}
          </button>
          <button type="button" onClick={onChangeStatus} disabled={closed} className={primaryBtn}>
            <GitPullRequestArrow className="h-4 w-4" strokeWidth={2} aria-hidden />
            Change Status
          </button>
          <div className="relative" ref={ref}>
            <button type="button" onClick={() => setMenuOpen((v) => !v)} aria-haspopup="menu" aria-expanded={menuOpen} className={secondaryBtn}>
              <MoreHorizontal className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden />
              More Actions
            </button>
            {menuOpen && (
              <div role="menu" className="absolute right-0 top-10 z-30 w-52 overflow-hidden rounded-md border border-[#EAECEE] bg-white py-1 shadow-panel">
                <button type="button" role="menuitem" disabled={closed} onClick={() => { setMenuOpen(false); onChangePriority(); }} className={menuItem}>
                  <Gauge className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden />
                  Change Priority
                </button>
                <button type="button" role="menuitem" disabled={closed} onClick={() => { setMenuOpen(false); onEscalate(); }} className={menuItem}>
                  <Flag className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden />
                  Escalate
                </button>
                <button type="button" role="menuitem" disabled={closed} onClick={() => { setMenuOpen(false); onMerge(); }} className={menuItem}>
                  <Merge className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden />
                  Merge Tickets
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
