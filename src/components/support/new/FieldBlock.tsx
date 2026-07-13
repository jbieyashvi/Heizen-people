import { cn } from "@/lib/cn";

interface FieldBlockProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  /** Right-aligned adornment on the label row, e.g. a character counter. */
  meta?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}

/** Shared wrapper: label row (+required/meta), control, hint & error text. */
export function FieldBlock({ id, label, required, hint, meta, error, children }: FieldBlockProps) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-heizen-600" aria-hidden>*</span>}
          {required && <span className="sr-only"> (required)</span>}
        </label>
        {meta}
      </div>

      {/* Pass aria-describedby to the control via context of the caller. */}
      <div data-described-by={describedBy || undefined}>{children}</div>

      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-slate-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className={cn("text-xs font-medium text-red-600")}>
          {error}
        </p>
      )}
    </div>
  );
}
