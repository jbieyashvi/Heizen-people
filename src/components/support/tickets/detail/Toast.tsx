"use client";

import { useEffect } from "react";
import { CircleCheck } from "lucide-react";

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
}

/** Subtle, auto-dismissing success toast (bottom-right). */
export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onDismiss, 2600);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-lg border border-emerald-100 bg-white px-4 py-2.5 shadow-panel"
    >
      <CircleCheck className="h-5 w-5 text-emerald-500" strokeWidth={1.75} aria-hidden />
      <span className="text-sm font-medium text-slate-700">{message}</span>
    </div>
  );
}
