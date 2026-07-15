"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useAdminTickets } from "@/lib/admin/useAdminTickets";
import {
  DEFAULT_FILTERS,
  buildQueryString,
  parseFilters,
  type AdminFilterState,
} from "@/lib/admin/adminFilters";
import { bucketsFor, previousRange, resolveRange } from "@/lib/admin/dateRange";
import {
  computeAttention,
  computeCategoryRanking,
  computeDepartmentStats,
  computeRecentActivity,
  computeSlaPerformance,
  computeStatusDistribution,
  computeTeamPerformance,
  computeTopMetrics,
  computeVolumeTrend,
  filterTickets,
} from "@/lib/admin/analytics";
import { Panel } from "@/components/agent/Panel";
import { ErrorPanel, InlineEmpty } from "@/components/agent/AgentStates";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { KpiRow } from "@/components/admin/KpiRow";
import { StatusDistribution } from "@/components/admin/StatusDistribution";
import { VolumeTrendChart } from "@/components/admin/VolumeTrendChart";
import { DepartmentTable } from "@/components/admin/DepartmentTable";
import { SlaPerformanceCard } from "@/components/admin/SlaPerformanceCard";
import { CategoryRanking } from "@/components/admin/CategoryRanking";
import { TeamPerformanceTable } from "@/components/admin/TeamPerformanceTable";
import { AdminTicketTable } from "@/components/admin/AdminTicketTable";
import { OperationalActivityFeed } from "@/components/admin/OperationalActivityFeed";

function Skeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-5">
      <div className="h-14 w-96 rounded bg-slate-100" />
      <div className="h-20 rounded-lg bg-slate-100" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="h-72 rounded-lg bg-slate-100" />
        <div className="h-72 rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}

export function AdminOverview() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { tickets, state, now, reload } = useAdminTickets();

  const urlFilters = parseFilters(searchParams);
  const [filters, setFilters] = useState<AdminFilterState>(urlFilters);
  const lastWritten = useRef<string>(buildQueryString(urlFilters));

  useEffect(() => {
    const key = buildQueryString(urlFilters);
    if (key !== lastWritten.current) {
      setFilters(urlFilters);
      lastWritten.current = key;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const commit = useCallback(
    (next: AdminFilterState) => {
      setFilters(next);
      const qs = buildQueryString(next);
      lastWritten.current = qs;
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );
  const update = useCallback((patch: Partial<AdminFilterState>) => commit({ ...filters, ...patch }), [commit, filters]);
  const reset = useCallback(() => commit({ ...DEFAULT_FILTERS }), [commit]);

  if (state === "loading") return <Skeleton />;

  if (state === "error") {
    return (
      <div className="flex flex-col gap-5">
        <AdminHeader filters={filters} onChange={update} onReset={reset} />
        <ErrorPanel onRetry={reload} />
      </div>
    );
  }

  const range = resolveRange(filters.range, now, filters.from, filters.to);
  const prev = previousRange(range);
  const { buckets } = bucketsFor(range);

  const base = filterTickets(tickets, { from: range.from, to: range.to, team: filters.team, category: filters.category });
  const prevBase = filterTickets(tickets, { from: prev.from, to: prev.to, team: filters.team, category: filters.category });
  const deptSet = filterTickets(tickets, { from: range.from, to: range.to, team: "all", category: filters.category });
  const catSet = filterTickets(tickets, { from: range.from, to: range.to, team: filters.team, category: "all" });
  const catPrev = filterTickets(tickets, { from: prev.from, to: prev.to, team: filters.team, category: "all" });

  const metrics = computeTopMetrics(base, prevBase);
  const status = computeStatusDistribution(base);
  const trend = computeVolumeTrend(base, buckets);
  const departments = computeDepartmentStats(deptSet);
  const sla = computeSlaPerformance(base, prevBase);
  const categories = computeCategoryRanking(catSet, catPrev);
  const teamPerf = computeTeamPerformance(deptSet);
  const attention = computeAttention(base, now);
  const activity = computeRecentActivity(base);

  return (
    <div className="flex flex-col gap-5">
      <AdminHeader filters={filters} onChange={update} onReset={reset} />

      {base.length === 0 ? (
        <>
          <KpiRow metrics={metrics} />
          <Panel>
            <InlineEmpty title="No tickets in the selected range" note="Widen the date range or reset the filters to see analytics." />
          </Panel>
        </>
      ) : (
        <>
          <KpiRow metrics={metrics} />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Panel title="Status overview"><StatusDistribution slices={status} /></Panel>
            <Panel title="Ticket volume trend"><VolumeTrendChart points={trend} /></Panel>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Panel title="Department-wise tickets"><DepartmentTable stats={departments} activeTeam={filters.team} onSelectTeam={(team) => update({ team })} /></Panel>
            <Panel title="SLA performance"><SlaPerformanceCard perf={sla} /></Panel>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Panel title="Top request categories"><CategoryRanking stats={categories} /></Panel>
            <Panel title="Support team performance"><TeamPerformanceTable rows={teamPerf} /></Panel>
          </div>

          <Panel title="Tickets requiring attention" bodyClassName={attention.length === 0 ? undefined : "p-0"}>
            {attention.length === 0 ? (
              <InlineEmpty icon={CheckCircle2} title="No tickets requiring attention" note="No breaches, critical or stale unassigned tickets right now." />
            ) : (
              <AdminTicketTable rows={attention} />
            )}
          </Panel>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Panel title="Recent operational activity"><OperationalActivityFeed items={activity} /></Panel>
            </div>
            <Panel title="Employee satisfaction">
              <p className="text-sm text-slate-500">Employee Satisfaction reporting requires Phase 1 scope confirmation.</p>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
