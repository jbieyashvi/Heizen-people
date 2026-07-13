import { cn } from "@/lib/cn";

interface LogoProps {
  /** When collapsed only the mark is shown, not the wordmark. */
  collapsed?: boolean;
}

/** Heizen People logo — mark plus wordmark. */
export function Logo({ collapsed = false }: LogoProps) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-heizen-500 text-sm font-bold text-white"
        aria-hidden
      >
        H
      </span>
      <span className={cn("flex flex-col leading-tight", collapsed && "hidden")}>
        <span className="text-sm font-semibold text-slate-800">Heizen People</span>
        <span className="text-[11px] font-medium text-slate-400">Employee Portal</span>
      </span>
    </span>
  );
}
