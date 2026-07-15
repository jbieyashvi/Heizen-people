"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { QUEUE_ORDER, QUEUES, type QueueKey } from "@/lib/agent/queues";

interface QueueNavProps {
  activeQueue: QueueKey;
  counts: Record<QueueKey, number>;
}

/** Compact queue switcher. Selecting a queue starts a fresh (unfiltered) view. */
export function QueueNav({ activeQueue, counts }: QueueNavProps) {
  return (
    <nav aria-label="Ticket queues" className="overflow-x-auto">
      <ul className="flex items-center gap-1 rounded-lg border border-[#EAECEE] bg-white p-1">
        {QUEUE_ORDER.map((key) => {
          const active = key === activeQueue;
          return (
            <li key={key}>
              <Link
                href={`/agent/tickets?queue=${key}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-medium outline-none transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-heizen-400",
                  active ? "bg-heizen-50 text-heizen-700" : "text-slate-600 hover:bg-slate-50",
                )}
              >
                {QUEUES[key].label}
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                    active ? "bg-heizen-100 text-heizen-700" : "bg-slate-100 text-slate-500",
                  )}
                >
                  {counts[key]}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
