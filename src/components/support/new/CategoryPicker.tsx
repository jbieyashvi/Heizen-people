"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { getCategoryIcon } from "@/lib/admin/categoryIcons";
import { FieldBlock } from "./FieldBlock";

export interface CategoryOption {
  id: string;
  name: string;
  icon: string;
}

interface CategoryPickerProps {
  categories: CategoryOption[];
  value: string | null;
  onChange: (id: string) => void;
  error?: string;
  fieldId: string;
  /** Read-only preview mode (no selection changes). */
  readOnly?: boolean;
}

export function CategoryPicker({ categories, value, onChange, error, fieldId, readOnly }: CategoryPickerProps) {
  return (
    <FieldBlock id={fieldId} label="Request Category" required error={error}>
      <div role="radiogroup" aria-label="Request category" className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {categories.map((category, index) => {
          const Icon = getCategoryIcon(category.icon);
          const selected = value === category.id;
          return (
            <button
              key={category.id}
              type="button"
              role="radio"
              aria-checked={selected}
              id={index === 0 ? fieldId : undefined}
              onClick={() => !readOnly && onChange(category.id)}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left outline-none transition-colors",
                "focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-1",
                selected ? "border-heizen-300 bg-heizen-50/60" : "border-[#EAECEE] bg-white hover:border-heizen-200 hover:bg-slate-50",
              )}
            >
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors", selected ? "border-heizen-200 bg-white text-heizen-600" : "border-[#EAECEE] bg-surface-muted text-slate-400 group-hover:text-slate-600")}>
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
              </span>
              <span className={cn("text-sm font-medium", selected ? "text-heizen-800" : "text-slate-700")}>{category.name}</span>
              {selected && <Check className="ml-auto h-4 w-4 shrink-0 text-heizen-600" strokeWidth={2.25} aria-hidden />}
            </button>
          );
        })}
      </div>
    </FieldBlock>
  );
}
