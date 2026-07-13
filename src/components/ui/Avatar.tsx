import { cn } from "@/lib/cn";

interface AvatarProps {
  initials: string;
  className?: string;
}

/** Compact initials avatar — no external image dependency. */
export function Avatar({ initials, className }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-heizen-100 text-xs font-semibold text-heizen-700",
        "h-8 w-8 shrink-0 select-none",
        className,
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}
