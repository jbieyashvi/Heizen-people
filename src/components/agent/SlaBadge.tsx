import { CircleCheck, TriangleAlert, Clock, PauseCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { SlaInfo, SlaState } from "@/lib/types";

const STYLES: Record<SlaState, { cls: string; icon: LucideIcon }> = {
  within: { cls: "border-emerald-100 bg-emerald-50 text-emerald-700", icon: CircleCheck },
  approaching: { cls: "border-amber-200 bg-amber-50 text-amber-800", icon: Clock },
  breached: { cls: "border-red-200 bg-red-50 text-red-700", icon: TriangleAlert },
  paused: { cls: "border-slate-200 bg-slate-50 text-slate-500", icon: PauseCircle },
  met: { cls: "border-emerald-100 bg-emerald-50 text-emerald-700", icon: CircleCheck },
};

/** SLA state pill — colour plus an icon and text (never colour alone). */
export function SlaBadge({ sla }: { sla: SlaInfo }) {
  // "Resolved after breach" is a met state, but flag it amber so it reads differently.
  const afterBreach = sla.state === "met" && sla.label.toLowerCase().includes("after breach");
  const base = STYLES[sla.state];
  const cls = afterBreach ? "border-amber-200 bg-amber-50 text-amber-800" : base.cls;
  const Icon = afterBreach ? TriangleAlert : base.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium",
        cls,
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
      {sla.label}
    </span>
  );
}
