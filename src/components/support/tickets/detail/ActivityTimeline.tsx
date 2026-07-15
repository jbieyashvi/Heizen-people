import type { ActivityEvent } from "@/lib/types";
import { formatDisplayDateTime } from "@/lib/support/dateFormat";

export function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  const ordered = [...events].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <ol className="flex flex-col">
      {ordered.map((event, i) => {
        const isLast = i === ordered.length - 1;
        return (
          <li key={event.id} className="flex gap-3">
            {/* Rail */}
            <div className="flex flex-col items-center">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full border border-heizen-300 bg-heizen-100" aria-hidden />
              {!isLast && <span className="w-px flex-1 bg-[#EAECEE]" aria-hidden />}
            </div>
            <div className={isLast ? "pb-0" : "pb-4"}>
              <p className="text-xs font-medium text-slate-700">{event.label}</p>
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
