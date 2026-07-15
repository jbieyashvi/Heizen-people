"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import type { RequestType } from "@/lib/admin/categoryTypes";
import { FieldBlock } from "./FieldBlock";

interface RequestTypeSelectProps {
  /** Active + visible request types for the selected category. */
  options: RequestType[];
  categorySelected: boolean;
  value: string | null;
  onChange: (rt: RequestType) => void;
  error?: string;
  fieldId: string;
  readOnly?: boolean;
}

export function RequestTypeSelect({ options, categorySelected, value, onChange, error, fieldId, readOnly }: RequestTypeSelectProps) {
  const disabled = !categorySelected || readOnly;
  const selected = options.find((o) => o.name === value);

  return (
    <FieldBlock
      id={fieldId}
      label="Request Type"
      required
      error={error}
      hint={!categorySelected ? "Select a category first to see request types." : selected?.helperText || undefined}
    >
      <div className="relative">
        <select
          id={fieldId}
          value={value ?? ""}
          disabled={disabled}
          onChange={(e) => {
            const rt = options.find((o) => o.name === e.target.value);
            if (rt) onChange(rt);
          }}
          aria-invalid={error ? true : undefined}
          className={cn(
            "h-10 w-full appearance-none rounded-md border bg-white pl-3 pr-9 text-sm outline-none transition-colors",
            "focus:border-heizen-300 focus:ring-2 focus:ring-heizen-100",
            error ? "border-red-300" : "border-[#EAECEE]",
            disabled ? "cursor-not-allowed bg-surface-muted text-slate-400" : "text-slate-700",
          )}
        >
          <option value="" disabled>{!categorySelected ? "—" : "Select a request type"}</option>
          {options.map((type) => (
            <option key={type.id} value={type.name}>{type.name}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={1.75} aria-hidden />
      </div>
    </FieldBlock>
  );
}
