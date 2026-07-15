"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AgentTicket } from "@/lib/types";
import { currentAgent } from "@/lib/roles/roles";
import { useAgentTickets } from "@/lib/agent/useAgentTickets";
import {
  QUEUE_ORDER,
  QUEUES,
  countForQueue,
  filterQueue,
  resolveQueue,
  type QueueKey,
} from "@/lib/agent/queues";
import {
  DEFAULT_FILTERS,
  PAGE_SIZE,
  applyFilters,
  buildQueryString,
  hasActiveFilters,
  paginate,
  parseFilters,
  sortRows,
  totalPages,
  type AgentFilterState,
  type AgentSortKey,
} from "@/lib/agent/agentFilters";
import { computeTeamWorkload } from "@/lib/agent/agentTickets";
import { ErrorPanel } from "@/components/agent/AgentStates";
import { Toast } from "@/components/support/tickets/detail/Toast";
import { QueueNav } from "@/components/agent/queue/QueueNav";
import { QueueHeader } from "@/components/agent/queue/QueueHeader";
import { AgentFilterToolbar } from "@/components/agent/queue/AgentFilterToolbar";
import { AgentQueueTable } from "@/components/agent/queue/AgentQueueTable";
import { QueueEmptyState } from "@/components/agent/queue/QueueEmptyState";
import { AssignmentModal } from "@/components/agent/queue/AssignmentModal";

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-[#EAECEE] bg-white">
      <div className="divide-y divide-[#EAECEE]">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            <div className="h-3.5 w-full animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AgentQueueView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { tickets, state, now, reload, assign } = useAgentTickets();
  const me = currentAgent.name;

  const queue = resolveQueue(searchParams.get("queue"));
  const urlFilters = useMemo(() => parseFilters(searchParams), [searchParams]);

  // URL is the source of truth; local state mirrors it for snappy interactions.
  const [filters, setFilters] = useState<AgentFilterState>(urlFilters);
  const lastWritten = useRef<string>(buildQueryString(queue, urlFilters));

  useEffect(() => {
    const key = buildQueryString(queue, urlFilters);
    if (key !== lastWritten.current) {
      setFilters(urlFilters);
      lastWritten.current = key;
    }
  }, [queue, urlFilters]);

  const commit = useCallback(
    (next: AgentFilterState) => {
      setFilters(next);
      const qs = buildQueryString(queue, next);
      lastWritten.current = qs;
      router.replace(`${pathname}?${qs}`, { scroll: false });
    },
    [pathname, queue, router],
  );

  const update = useCallback(
    (patch: Partial<AgentFilterState>) => {
      const paging = "page" in patch;
      commit({ ...filters, ...patch, page: paging ? (patch.page as number) : 1 });
    },
    [commit, filters],
  );

  const handleSort = useCallback(
    (key: AgentSortKey) => {
      if (filters.sort === key) commit({ ...filters, dir: filters.dir === "asc" ? "desc" : "asc" });
      else commit({ ...filters, sort: key, dir: "desc" });
    },
    [commit, filters],
  );

  const clearFilters = useCallback(() => commit({ ...DEFAULT_FILTERS }), [commit]);

  // Assignment modal state.
  const [assignTicket, setAssignTicket] = useState<AgentTicket | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const workloads = useMemo(() => computeTeamWorkload(tickets), [tickets]);
  const counts = useMemo(() => {
    const out = {} as Record<QueueKey, number>;
    for (const key of QUEUE_ORDER) out[key] = countForQueue(tickets, key, me);
    return out;
  }, [tickets, me]);

  const results = useMemo(() => {
    const cohort = filterQueue(tickets, queue, me);
    const filtered = applyFilters(cohort, filters, queue);
    return sortRows(filtered, filters, queue);
  }, [tickets, queue, me, filters]);

  const pageCount = totalPages(results.length);
  const page = Math.min(filters.page, pageCount);
  const pageRows = useMemo(() => paginate(results, page), [results, page]);

  const filtersActive = hasActiveFilters(filters);

  function confirmAssign(agentName: string, agentId: string) {
    const wasReassign = assignTicket?.assignedAgent !== null;
    if (assignTicket) assign(assignTicket.id, { agentName, agentId });
    setAssignTicket(null);
    setToast(wasReassign ? `Reassigned to ${agentName}.` : `Assigned to ${agentName}.`);
  }

  return (
    <div className="flex flex-col gap-4">
      <QueueHeader queue={QUEUES[queue]} resultCount={results.length} lastRefreshed={now} onRefresh={reload} />

      <QueueNav activeQueue={queue} counts={counts} />

      <AgentFilterToolbar filters={filters} onChange={update} onClear={clearFilters} />

      {state === "loading" ? (
        <TableSkeleton />
      ) : state === "error" ? (
        <ErrorPanel onRetry={reload} />
      ) : results.length === 0 ? (
        <QueueEmptyState queue={QUEUES[queue]} filtersActive={filtersActive} onClear={clearFilters} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#EAECEE] bg-white">
          <AgentQueueTable
            rows={pageRows}
            sort={filters.sort}
            dir={filters.dir}
            onSort={handleSort}
            onAssign={(t) => setAssignTicket(t)}
            onReassign={(t) => setAssignTicket(t)}
          />
          <div className="flex flex-col items-center justify-between gap-3 border-t border-[#EAECEE] px-4 py-3 sm:flex-row">
            <p className="text-xs text-slate-500" aria-live="polite">
              Showing <span className="font-medium text-slate-700">{(page - 1) * PAGE_SIZE + 1}</span>–
              <span className="font-medium text-slate-700">{Math.min(page * PAGE_SIZE, results.length)}</span> of{" "}
              <span className="font-medium text-slate-700">{results.length}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => update({ page: page - 1 })}
                disabled={page <= 1}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-[#EAECEE] bg-white px-2.5 text-xs font-medium text-slate-600 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                Previous
              </button>
              <span className="px-1 text-xs text-slate-500">
                Page <span className="font-medium text-slate-700">{page}</span> of {pageCount}
              </span>
              <button
                type="button"
                onClick={() => update({ page: page + 1 })}
                disabled={page >= pageCount}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-[#EAECEE] bg-white px-2.5 text-xs font-medium text-slate-600 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </button>
            </div>
          </div>
        </div>
      )}

      <AssignmentModal
        open={assignTicket !== null}
        ticket={assignTicket}
        workloads={workloads}
        onCancel={() => setAssignTicket(null)}
        onConfirm={confirmAssign}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
