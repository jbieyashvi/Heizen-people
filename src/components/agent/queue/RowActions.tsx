"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MoreHorizontal, UserPlus, Repeat } from "lucide-react";
import type { AgentTicket } from "@/lib/types";

interface RowActionsProps {
  ticket: AgentTicket;
  onAssign: (ticket: AgentTicket) => void;
  onReassign: (ticket: AgentTicket) => void;
}

/** Primary "View" stays visible; Assign/Reassign are contextual. */
export function RowActions({ ticket, onAssign, onReassign }: RowActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isUnassigned = ticket.assignedAgent === null;

  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
      <Link
        href={`/agent/tickets/${ticket.id}`}
        className="inline-flex items-center rounded-md border border-[#EAECEE] px-2.5 py-1 text-xs font-medium text-heizen-700 outline-none transition-colors hover:border-heizen-200 hover:bg-heizen-50 focus-visible:ring-2 focus-visible:ring-heizen-400"
        aria-label={`View ticket ${ticket.id}`}
      >
        View
      </Link>

      {isUnassigned ? (
        <button
          type="button"
          onClick={() => onAssign(ticket)}
          className="inline-flex items-center gap-1 rounded-md border border-heizen-200 bg-heizen-50 px-2.5 py-1 text-xs font-medium text-heizen-700 outline-none transition-colors hover:bg-heizen-100 focus-visible:ring-2 focus-visible:ring-heizen-400"
        >
          <UserPlus className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          Assign
        </button>
      ) : (
        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`More actions for ${ticket.id}`}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[#EAECEE] text-slate-500 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400"
          >
            <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-8 z-20 w-40 overflow-hidden rounded-md border border-[#EAECEE] bg-white py-1 shadow-panel"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onReassign(ticket);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-slate-600 outline-none hover:bg-slate-50 focus-visible:bg-slate-50"
              >
                <Repeat className="h-4 w-4 text-slate-400" strokeWidth={1.75} aria-hidden />
                Reassign
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
