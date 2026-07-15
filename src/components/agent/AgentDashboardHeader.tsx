import { Users, CalendarDays } from "lucide-react";
import { currentAgent } from "@/lib/roles/roles";
import { formatDisplayDate } from "@/lib/support/dateFormat";

export function AgentDashboardHeader({ now }: { now: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-sm font-medium text-heizen-700">Good morning, {currentAgent.firstName}</p>
        <h2 className="mt-0.5 text-xl font-semibold text-slate-900">Support Overview</h2>
        <p className="mt-0.5 text-sm text-slate-500">Here&rsquo;s what needs your attention today.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
          <Users className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} aria-hidden />
          {currentAgent.department}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-[#EAECEE] bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
          <CalendarDays className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} aria-hidden />
          {formatDisplayDate(now)}
        </span>
      </div>
    </div>
  );
}
