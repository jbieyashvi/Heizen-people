"use client";

import { Info } from "lucide-react";
import { cn } from "@/lib/cn";
import { PRIORITY_OPTIONS } from "@/lib/config/ticketForm";
import type { TicketPriority } from "@/lib/types";

interface PriorityPickerProps {
  value: TicketPriority;
  onChange: (value: TicketPriority) => void;
}

export function PriorityPicker({ value, onChange }: PriorityPickerProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-sm font-medium text-slate-700">Priority</span>

      <div role="radiogroup" aria-label="Priority" className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {PRIORITY_OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.value)}
              className={cn(
                "flex flex-col gap-1 rounded-lg border px-3 py-2.5 text-left outline-none transition-colors",
                "focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-1",
                selected
                  ? "border-heizen-300 bg-heizen-50/60"
                  : "border-[#EAECEE] bg-white hover:border-heizen-200 hover:bg-slate-50",
              )}
            >
              <span className={cn("text-sm font-medium", selected ? "text-heizen-800" : "text-slate-700")}>
                {option.label}
              </span>
              <span className="text-xs leading-snug text-slate-500">{option.description}</span>
            </button>
          );
        })}
      </div>

      <p className="flex items-center gap-1.5 text-xs text-slate-400">
        <Info className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
        Critical priority can only be assigned by the support team.
      </p>
    </div>
  );
}
