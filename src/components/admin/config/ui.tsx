import { cn } from "@/lib/cn";
import type { EntityStatus } from "@/lib/admin/orgTypes";

export const inputClass =
  "h-9 w-full rounded-md border border-[#EAECEE] bg-white px-2.5 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-heizen-300 focus:ring-2 focus:ring-heizen-100";

export function StatusTag({ status }: { status: EntityStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium",
        status === "Active" ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-500",
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", status === "Active" ? "bg-emerald-500" : "bg-slate-400")} aria-hidden />
      {status}
    </span>
  );
}

export function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-xs font-medium text-slate-600">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
      {error && <p className="text-[11px] font-medium text-red-600">{error}</p>}
    </div>
  );
}

export interface SummaryItem {
  label: string;
  value: string | number;
  tone?: "default" | "amber";
}

export function SummaryTiles({ items }: { items: SummaryItem[] }) {
  return (
    <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((it) => (
        <li key={it.label} className={cn("flex flex-col gap-0.5 rounded-lg border px-3.5 py-2.5", it.tone === "amber" ? "border-amber-200 bg-amber-50/50" : "border-[#EAECEE] bg-white")}>
          <span className={cn("text-xl font-semibold tabular-nums", it.tone === "amber" ? "text-amber-800" : "text-slate-900")}>{it.value}</span>
          <span className="text-xs text-slate-500">{it.label}</span>
        </li>
      ))}
    </ul>
  );
}
