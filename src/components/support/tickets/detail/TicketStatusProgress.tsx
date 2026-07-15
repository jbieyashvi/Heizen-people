import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TicketDetail, TicketStatus } from "@/lib/types";
import { STATUS_ORDER, employeeStatusLabel } from "@/lib/support/statusConfig";

type StageState = "completed" | "current" | "upcoming";

function computeStageState(
  stage: TicketStatus,
  detail: TicketDetail,
  waited: boolean,
): StageState {
  if (stage === detail.status) return "current";
  const idx = STATUS_ORDER.indexOf(stage);
  const curIdx = STATUS_ORDER.indexOf(detail.status);

  if (stage === "Waiting for Employee") {
    return waited && idx < curIdx ? "completed" : "upcoming";
  }
  return idx < curIdx ? "completed" : "upcoming";
}

export function TicketStatusProgress({ detail }: { detail: TicketDetail }) {
  const waited =
    detail.status === "Waiting for Employee" ||
    detail.activity.some((a) => a.label.includes("Waiting for Employee"));
  const isWaiting = detail.status === "Waiting for Employee";

  return (
    <div className="flex flex-col gap-3">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-2">
        {STATUS_ORDER.map((stage, i) => {
          const stageState = computeStageState(stage, detail, waited);
          const isCurrentWaiting = stageState === "current" && stage === "Waiting for Employee";
          const label = employeeStatusLabel(stage);

          return (
            <li key={stage} className="flex items-center gap-1">
              <span
                aria-current={stageState === "current" ? "step" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium",
                  stageState === "completed" && "border-heizen-100 bg-heizen-50/60 text-heizen-700",
                  stageState === "current" && !isCurrentWaiting && "border-heizen-300 bg-heizen-50 text-heizen-800",
                  isCurrentWaiting && "border-amber-300 bg-amber-50 text-amber-800",
                  stageState === "upcoming" && "border-[#EAECEE] bg-white text-slate-400",
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full text-[10px]",
                    stageState === "completed" && "bg-heizen-500 text-white",
                    stageState === "current" && !isCurrentWaiting && "bg-heizen-600 text-white",
                    isCurrentWaiting && "bg-amber-500 text-white",
                    stageState === "upcoming" && "border border-slate-200 bg-white text-slate-300",
                  )}
                  aria-hidden
                >
                  {stageState === "completed" ? (
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                  ) : (
                    i + 1
                  )}
                </span>
                {label}
              </span>
              {i < STATUS_ORDER.length - 1 && (
                <span className="hidden h-px w-3 bg-[#E3E6E8] sm:block" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>

      {isWaiting && (
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50/70 px-3 py-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" strokeWidth={1.75} aria-hidden />
          <p className="text-sm text-amber-800">
            The support team needs additional information from you.
          </p>
        </div>
      )}
    </div>
  );
}
