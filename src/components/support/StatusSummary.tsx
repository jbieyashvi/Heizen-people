"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { statusSummary } from "@/lib/data/summary";

export function StatusSummary() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {statusSummary.map((item) => {
        const isSelected = selected === item.key;
        return (
          <li key={item.key}>
            <button
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelected((cur) => (cur === item.key ? null : item.key))}
              className={cn(
                "flex w-full flex-col items-start gap-1 rounded-lg border px-3.5 py-3 text-left outline-none transition-colors",
                "focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-1",
                item.highlight
                  ? "border-amber-200 bg-amber-50/70 hover:bg-amber-50"
                  : "border-[#EAECEE] bg-white hover:bg-slate-50",
                isSelected && "ring-2 ring-heizen-400 ring-offset-1",
              )}
            >
              <span
                className={cn(
                  "text-2xl font-semibold tabular-nums",
                  item.highlight ? "text-amber-700" : "text-slate-900",
                )}
              >
                {item.count}
              </span>
              <span
                className={cn(
                  "text-xs font-medium",
                  item.highlight ? "text-amber-700" : "text-slate-500",
                )}
              >
                {item.label}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
