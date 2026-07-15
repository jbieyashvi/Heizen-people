const COLUMNS = [
  "Ticket ID",
  "Subject",
  "Category",
  "Priority",
  "Assigned Team",
  "Status",
  "Created On",
  "Updated On",
  "Action",
];

/** Subtle loading placeholder that mirrors the tickets table layout. */
export function TicketsTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#EAECEE] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#EAECEE] bg-surface-muted">
              {COLUMNS.map((col) => (
                <th
                  key={col}
                  scope="col"
                  className="whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAECEE]">
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {COLUMNS.map((col) => (
                  <td key={col} className="px-4 py-3.5">
                    <div className="h-3.5 rounded bg-slate-100" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
