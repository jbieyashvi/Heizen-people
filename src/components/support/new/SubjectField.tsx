"use client";

import { cn } from "@/lib/cn";
import { SUBJECT_MAX_LENGTH } from "@/lib/config/ticketForm";
import { FieldBlock } from "./FieldBlock";

interface SubjectFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  fieldId: string;
}

export function SubjectField({ value, onChange, onBlur, error, fieldId }: SubjectFieldProps) {
  const count = value.length;

  return (
    <FieldBlock
      id={fieldId}
      label="Subject"
      required
      error={error}
      meta={
        <span className={cn("text-xs tabular-nums", count > SUBJECT_MAX_LENGTH ? "text-red-600" : "text-slate-400")}>
          {count}/{SUBJECT_MAX_LENGTH}
        </span>
      }
    >
      <input
        id={fieldId}
        type="text"
        value={value}
        maxLength={SUBJECT_MAX_LENGTH}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={error ? true : undefined}
        placeholder="Brief summary of your request"
        className={cn(
          "h-10 w-full rounded-md border bg-white px-3 text-sm text-slate-700 outline-none transition-colors",
          "placeholder:text-slate-400 focus:border-heizen-300 focus:ring-2 focus:ring-heizen-100",
          error ? "border-red-300" : "border-[#EAECEE]",
        )}
      />
    </FieldBlock>
  );
}
