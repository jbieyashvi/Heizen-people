"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { getRequestTypes } from "@/lib/config/ticketForm";
import type { TicketCategoryKey } from "@/lib/types";
import { FieldBlock } from "./FieldBlock";

interface RequestTypeSelectProps {
  category: TicketCategoryKey | null;
  value: string | null;
  onChange: (value: string) => void;
  error?: string;
  fieldId: string;
}

export function RequestTypeSelect({ category, value, onChange, error, fieldId }: RequestTypeSelectProps) {
  const options = getRequestTypes(category);
  const disabled = !category;

  return (
    <FieldBlock
      id={fieldId}
      label="Request Type"
      required
      error={error}
      hint={disabled ? "Select a category first to see request types." : undefined}
    >
      <div className="relative">
        <select
          id={fieldId}
          value={value ?? ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          className={cn(
            "h-10 w-full appearance-none rounded-md border bg-white pl-3 pr-9 text-sm outline-none transition-colors",
            "focus:border-heizen-300 focus:ring-2 focus:ring-heizen-100",
            error ? "border-red-300" : "border-[#EAECEE]",
            disabled ? "cursor-not-allowed bg-surface-muted text-slate-400" : "text-slate-700",
          )}
        >
          <option value="" disabled>
            {disabled ? "—" : "Select a request type"}
          </option>
          {options.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          strokeWidth={1.75}
          aria-hidden
        />
      </div>
    </FieldBlock>
  );
}
