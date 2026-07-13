"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { TICKET_CATEGORIES } from "@/lib/config/ticketForm";
import type { TicketCategoryKey } from "@/lib/types";
import { FieldBlock } from "./FieldBlock";

interface CategoryPickerProps {
  value: TicketCategoryKey | null;
  onChange: (value: TicketCategoryKey) => void;
  error?: string;
  fieldId: string;
}

export function CategoryPicker({ value, onChange, error, fieldId }: CategoryPickerProps) {
  return (
    <FieldBlock id={fieldId} label="Request Category" required error={error}>
      <div
        role="radiogroup"
        aria-label="Request category"
        className="grid grid-cols-2 gap-2.5 sm:grid-cols-3"
      >
        {TICKET_CATEGORIES.map((category, index) => {
          const Icon = category.icon;
          const selected = value === category.key;
          return (
            <button
              key={category.key}
              type="button"
              role="radio"
              aria-checked={selected}
              id={index === 0 ? fieldId : undefined}
              onClick={() => onChange(category.key)}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left outline-none transition-colors",
                "focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-1",
                selected
                  ? "border-heizen-300 bg-heizen-50/60"
                  : "border-[#EAECEE] bg-white hover:border-heizen-200 hover:bg-slate-50",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors",
                  selected
                    ? "border-heizen-200 bg-white text-heizen-600"
                    : "border-[#EAECEE] bg-surface-muted text-slate-400 group-hover:text-slate-600",
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
              </span>
              <span className={cn("text-sm font-medium", selected ? "text-heizen-800" : "text-slate-700")}>
                {category.label}
              </span>
              {selected && (
                <Check
                  className="ml-auto h-4 w-4 shrink-0 text-heizen-600"
                  strokeWidth={2.25}
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>
    </FieldBlock>
  );
}
