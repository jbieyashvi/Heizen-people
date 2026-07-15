"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Sticky footer actions. */
  footer?: React.ReactNode;
  labelledBy?: string;
  widthClass?: string;
}

/** Accessible right-side drawer with sticky header + optional sticky footer. */
export function Drawer({ open, onClose, title, description, children, footer, labelledBy = "drawer-title", widthClass = "max-w-md" }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      restoreRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30" onMouseDown={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onMouseDown={(e) => e.stopPropagation()}
        className={cn("flex h-full w-full flex-col border-l border-[#EAECEE] bg-white shadow-panel", widthClass)}
      >
        {/* Sticky header */}
        <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-[#EAECEE] bg-white px-5 py-3.5">
          <div className="min-w-0">
            <h2 id={labelledBy} className="text-base font-semibold text-slate-900">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 outline-none hover:bg-slate-50 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-heizen-400"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {/* Sticky footer */}
        {footer && (
          <div className="sticky bottom-0 flex items-center justify-end gap-2.5 border-t border-[#EAECEE] bg-white px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
