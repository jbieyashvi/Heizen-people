import Link from "next/link";
import { cn } from "@/lib/cn";
import type { AttentionCounts } from "@/lib/agent/agentTickets";

type Tone = "default" | "amber" | "red";

interface Tile {
  label: string;
  count: number;
  queue: string;
  tone: Tone;
}

const TONES: Record<Tone, { card: string; count: string }> = {
  default: { card: "border-[#EAECEE] bg-white hover:bg-slate-50", count: "text-slate-900" },
  amber: { card: "border-amber-200 bg-amber-50/60 hover:bg-amber-50", count: "text-amber-800" },
  red: { card: "border-red-200 bg-red-50/60 hover:bg-red-50", count: "text-red-700" },
};

export function AttentionSummary({ counts }: { counts: AttentionCounts }) {
  const tiles: Tile[] = [
    { label: "Assigned to Me", count: counts.assignedToMe, queue: "my-tickets", tone: "default" },
    { label: "Unassigned", count: counts.unassigned, queue: "unassigned", tone: "default" },
    { label: "Due Soon", count: counts.dueSoon, queue: "due-soon", tone: "amber" },
    { label: "Overdue", count: counts.overdue, queue: "overdue", tone: "red" },
    { label: "High Priority", count: counts.highPriority, queue: "high-priority", tone: "default" },
    { label: "Waiting for Employee", count: counts.waitingForEmployee, queue: "waiting", tone: "default" },
  ];

  return (
    <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6" aria-label="Attention summary">
      {tiles.map((tile) => {
        const tone = TONES[tile.tone];
        return (
          <li key={tile.queue}>
            <Link
              href={`/agent/tickets?queue=${tile.queue}`}
              className={cn(
                "flex flex-col gap-1 rounded-lg border px-3 py-2.5 outline-none transition-colors",
                "focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-1",
                tone.card,
              )}
            >
              <span className={cn("text-2xl font-semibold tabular-nums", tone.count)}>{tile.count}</span>
              <span className="text-xs font-medium text-slate-500">{tile.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
