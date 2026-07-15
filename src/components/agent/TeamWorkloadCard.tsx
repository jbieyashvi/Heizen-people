import { cn } from "@/lib/cn";
import type { TeamMemberWorkload } from "@/lib/agent/agentTickets";

const LOAD: Record<TeamMemberWorkload["load"], { label: string; dot: string; text: string }> = {
  available: { label: "Available", dot: "bg-emerald-500", text: "text-emerald-700" },
  balanced: { label: "Balanced", dot: "bg-heizen-500", text: "text-heizen-700" },
  heavy: { label: "Heavy", dot: "bg-amber-500", text: "text-amber-800" },
};

export function TeamWorkloadCard({ members }: { members: TeamMemberWorkload[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {members.map((m) => {
        const load = LOAD[m.load];
        return (
          <li key={m.name} className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md bg-heizen-100 text-xs font-semibold text-heizen-700">
              {m.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">{m.name}</p>
              <p className="text-xs text-slate-400">
                {m.active} active · {m.dueSoon} due soon
              </p>
            </div>
            <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", load.text)}>
              <span className={cn("h-2 w-2 rounded-full", load.dot)} aria-hidden />
              {load.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
