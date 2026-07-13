"use client";

import { useEffect, useRef } from "react";
import { CheckCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { notifications } from "@/lib/data/notifications";

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Notifications"
      className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-lg border border-[#EAECEE] bg-white shadow-panel"
    >
      <div className="flex items-center justify-between border-b border-[#EAECEE] px-3.5 py-2.5">
        <span className="text-sm font-semibold text-slate-800">Notifications</span>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-medium text-heizen-600 outline-none hover:text-heizen-700 focus-visible:underline"
        >
          <CheckCheck className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          Mark all read
        </button>
      </div>
      <ul className="max-h-80 divide-y divide-[#EAECEE] overflow-y-auto">
        {notifications.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              className="flex w-full items-start gap-2.5 px-3.5 py-3 text-left outline-none hover:bg-slate-50 focus-visible:bg-slate-50"
            >
              <span
                className={cn(
                  "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                  n.unread ? "bg-heizen-500" : "bg-transparent",
                )}
                aria-hidden
              />
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-slate-800">{n.title}</span>
                <span className="text-xs text-slate-500">{n.detail}</span>
                <span className="text-[11px] text-slate-400">{n.time}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
