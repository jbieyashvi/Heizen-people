"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import { useAdminTickets } from "@/lib/admin/useAdminTickets";
import { getOrgConfig } from "@/lib/admin/orgStore";
import { ORG_TEAMS } from "@/lib/roles/roles";
import { ErrorPanel, InlineEmpty } from "@/components/agent/AgentStates";
import { AdminTicketTable } from "@/components/admin/AdminTicketTable";

interface AllFilters {
  q: string;
  team: string;
}

function parse(sp: URLSearchParams): AllFilters {
  const team = sp.get("team");
  return { q: sp.get("q") ?? "", team: team && ORG_TEAMS.includes(team) ? team : "all" };
}

function build(f: AllFilters): string {
  const p = new URLSearchParams();
  if (f.q.trim()) p.set("q", f.q.trim());
  if (f.team !== "all") p.set("team", f.team);
  return p.toString();
}

const field = "h-9 rounded-md border border-[#EAECEE] bg-white px-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-heizen-300 focus:ring-2 focus:ring-heizen-100";

export function AdminAllTicketsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { tickets, state, reload } = useAdminTickets();

  const urlFilters = parse(searchParams);
  const [filters, setFilters] = useState<AllFilters>(urlFilters);
  const lastWritten = useRef<string>(build(urlFilters));

  useEffect(() => {
    const key = build(urlFilters);
    if (key !== lastWritten.current) {
      setFilters(urlFilters);
      lastWritten.current = key;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const commit = useCallback(
    (next: AllFilters) => {
      setFilters(next);
      const qs = build(next);
      lastWritten.current = qs;
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  // Optional department scoping (from Department Details → View Department Tickets).
  const departmentCode = searchParams.get("department");
  let departmentTeams: Set<string> | null = null;
  if (departmentCode) {
    const cfg = getOrgConfig();
    const dep = cfg.departments.find((d) => d.code === departmentCode);
    departmentTeams = new Set(cfg.teams.filter((t) => t.departmentId === dep?.id).map((t) => t.ticketTeam));
  }

  const q = filters.q.trim().toLowerCase();
  const rows = tickets.filter((t) => {
    if (departmentTeams && !departmentTeams.has(t.assignedTeam)) return false;
    if (filters.team !== "all" && t.assignedTeam !== filters.team) return false;
    if (q && !`${t.id} ${t.employeeName} ${t.subject}`.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <Link href="/admin/dashboard" className="inline-flex w-fit items-center gap-1.5 rounded-md text-sm font-medium text-slate-500 outline-none hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-heizen-400">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Back to Admin Overview
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">All Tickets</h2>
            <p className="mt-0.5 text-sm text-slate-500">Organization-wide tickets across every support team.</p>
          </div>
          {state === "ready" && (
            <p className="text-xs text-slate-500"><span className="font-medium text-slate-700">{rows.length}</span> {rows.length === 1 ? "ticket" : "tickets"}</p>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="admin-search" className="sr-only">Search tickets</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={1.75} aria-hidden />
          <input id="admin-search" type="search" value={filters.q} onChange={(e) => commit({ ...filters, q: e.target.value })} placeholder="Search ticket ID, employee or subject…" className="h-9 w-full rounded-md border border-[#EAECEE] bg-white pl-9 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-heizen-300 focus:ring-2 focus:ring-heizen-100" />
        </div>
        <div>
          <label htmlFor="admin-team" className="sr-only">Team</label>
          <select id="admin-team" value={filters.team} onChange={(e) => commit({ ...filters, team: e.target.value })} className={`${field} w-full sm:w-52`}>
            <option value="all">All teams</option>
            {ORG_TEAMS.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
        </div>
      </div>

      {state === "loading" ? (
        <div className="h-64 animate-pulse rounded-lg bg-slate-100" />
      ) : state === "error" ? (
        <ErrorPanel onRetry={reload} />
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-[#EAECEE] bg-white">
          <InlineEmpty title="No tickets match" note="Try a different search or team filter." />
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#EAECEE] bg-white">
          <AdminTicketTable rows={rows} />
        </div>
      )}
    </div>
  );
}
