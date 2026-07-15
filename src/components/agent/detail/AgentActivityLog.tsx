import { Lock } from "lucide-react";
import type { ActivityEvent } from "@/lib/types";
import { formatDisplayDateTime } from "@/lib/support/dateFormat";

export function AgentActivityLog({ events }: { events: ActivityEvent[] }) {
  const ordered = [...events].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  if (ordered.length === 0) {
    return <p className="text-sm text-slate-400">No activity recorded yet.</p>;
  }

  return (
    <ol className="flex flex-col">
      {ordered.map((event, i) => {
        const isLast = i === ordered.length - 1;
        return (
          <li key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={
                  event.internal
                    ? "mt-1 h-2 w-2 shrink-0 rounded-full border border-amber-300 bg-amber-100"
                    : "mt-1 h-2 w-2 shrink-0 rounded-full border border-heizen-300 bg-heizen-100"
                }
                aria-hidden
              />
              {!isLast && <span className="w-px flex-1 bg-[#EAECEE]" aria-hidden />}
            </div>
            <div className={isLast ? "pb-0" : "pb-4"}>
              <p className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                {event.label}
                {event.internal && (
                  <span className="inline-flex items-center gap-0.5 rounded bg-amber-50 px-1 py-0.5 text-[10px] font-semibold text-amber-700">
                    <Lock className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
                    Internal
                  </span>
                )}
              </p>
              {event.fromValue && event.toValue && (
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {event.fromValue} → <span className="font-medium text-slate-600">{event.toValue}</span>
                </p>
              )}
              <p className="mt-0.5 text-[11px] text-slate-400">
                {event.actor} · {formatDisplayDateTime(event.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
