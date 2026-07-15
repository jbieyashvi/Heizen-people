"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import type { TicketFilterState, TicketSortKey } from "@/lib/types";
import { useTickets } from "@/lib/support/useTickets";
import {
  applyFilters,
  computeStatusCounts,
  paginate,
  totalPages,
} from "@/lib/support/ticketFilters";
import { buildQueryString, filtersKey, parseFilters } from "@/lib/support/ticketQuery";
import { DEFAULT_FILTERS } from "@/lib/support/ticketFilters";
import { TicketSummaryBar } from "./TicketSummaryBar";
import { TicketFilters } from "./TicketFilters";
import { TicketsTable } from "./TicketsTable";
import { TicketsPagination } from "./TicketsPagination";
import { TicketsTableSkeleton } from "./TicketsTableSkeleton";
import { ErrorState, NoResultsState, NoTicketsState } from "./TicketsStates";

export function MyTicketsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { tickets, state, reload } = useTickets();

  // URL is the source of truth; local state mirrors it for snappy interactions.
  const urlFilters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const [filters, setFilters] = useState<TicketFilterState>(urlFilters);
  const lastWritten = useRef<string>(filtersKey(urlFilters));

  // Re-sync when the URL changes externally (back/forward, dashboard deep-links).
  useEffect(() => {
    const key = filtersKey(urlFilters);
    if (key !== lastWritten.current) {
      setFilters(urlFilters);
      lastWritten.current = key;
    }
  }, [urlFilters]);

  const commit = useCallback(
    (next: TicketFilterState) => {
      setFilters(next);
      const qs = buildQueryString(next);
      lastWritten.current = qs;
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  // Any filter/search change resets to page 1 (unless the patch sets page itself).
  const update = useCallback(
    (patch: Partial<TicketFilterState>) => {
      const paging = "page" in patch;
      commit({ ...filters, ...patch, page: paging ? (patch.page as number) : 1 });
    },
    [commit, filters],
  );

  const handleSort = useCallback(
    (key: TicketSortKey) => {
      if (filters.sort === key) {
        commit({ ...filters, dir: filters.dir === "asc" ? "desc" : "asc" });
      } else {
        commit({ ...filters, sort: key, dir: "desc" });
      }
    },
    [commit, filters],
  );

  const clearAll = useCallback(() => commit({ ...DEFAULT_FILTERS }), [commit]);

  // Derived data — counts from all tickets; results from filtered + sorted set.
  const counts = useMemo(() => computeStatusCounts(tickets), [tickets]);
  const results = useMemo(() => applyFilters(tickets, filters), [tickets, filters]);
  const pageCount = totalPages(results.length);
  const page = Math.min(filters.page, pageCount);
  const pageRows = useMemo(() => paginate(results, page), [results, page]);

  const isReady = state === "ready";
  const hasNoTickets = isReady && tickets.length === 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Breadcrumb
          items={[{ label: "Support Center", href: "/support" }, { label: "My Tickets" }]}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">My Tickets</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              View and track all your support requests.
            </p>
          </div>
          <Link
            href="/support/new"
            className="inline-flex h-9 w-fit shrink-0 items-center gap-1.5 rounded-md bg-heizen-500 px-3.5 text-sm font-medium text-white outline-none transition-colors hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
            Raise New Ticket
          </Link>
        </div>
      </div>

      {/* Body */}
      {state === "error" ? (
        <ErrorState onRetry={reload} />
      ) : hasNoTickets ? (
        <NoTicketsState />
      ) : (
        <>
          <TicketSummaryBar
            counts={counts}
            activeSlug={filters.status}
            onSelect={(slug) => update({ status: slug })}
          />

          <TicketFilters
            filters={filters}
            resultCount={results.length}
            onChange={update}
            onClear={clearAll}
          />

          {state === "loading" ? (
            <TicketsTableSkeleton />
          ) : results.length === 0 ? (
            <NoResultsState onClear={clearAll} />
          ) : (
            <div className="overflow-hidden rounded-lg border border-[#EAECEE] bg-white">
              <TicketsTable
                rows={pageRows}
                sort={filters.sort}
                dir={filters.dir}
                onSort={handleSort}
              />
              <TicketsPagination
                page={page}
                pageCount={pageCount}
                totalResults={results.length}
                onPageChange={(p) => update({ page: p })}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
