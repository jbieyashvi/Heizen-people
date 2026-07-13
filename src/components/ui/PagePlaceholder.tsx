import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

interface PagePlaceholderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  comingSoon?: boolean;
  backHref?: string;
  backLabel?: string;
}

/** Shared empty-state used for routes that are not built out yet. */
export function PagePlaceholder({
  icon: Icon,
  title,
  description,
  comingSoon = false,
  backHref,
  backLabel,
}: PagePlaceholderProps) {
  return (
    <div className="flex flex-col gap-6">
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex w-fit items-center gap-1.5 rounded-md text-sm font-medium text-slate-500 outline-none hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-heizen-400"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          {backLabel ?? "Back"}
        </Link>
      )}

      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-[#DDE1E4] bg-white px-6 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#EAECEE] bg-surface-muted text-slate-400">
          <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
        </span>
        <div className="max-w-md">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
            {comingSoon && (
              <span
                className={cn(
                  "rounded border border-heizen-200 bg-heizen-50 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-heizen-700",
                )}
              >
                Coming Soon
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
}
