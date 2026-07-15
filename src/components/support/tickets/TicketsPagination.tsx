import { ChevronLeft, ChevronRight } from "lucide-react";
import { PAGE_SIZE } from "@/lib/support/ticketFilters";

interface TicketsPaginationProps {
  page: number;
  pageCount: number;
  totalResults: number;
  onPageChange: (page: number) => void;
}

const navBtn =
  "inline-flex h-8 items-center gap-1 rounded-md border border-[#EAECEE] bg-white px-2.5 text-xs font-medium text-slate-600 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400 disabled:cursor-not-allowed disabled:opacity-50";

export function TicketsPagination({
  page,
  pageCount,
  totalResults,
  onPageChange,
}: TicketsPaginationProps) {
  const start = totalResults === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, totalResults);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-[#EAECEE] px-4 py-3 sm:flex-row">
      <p className="text-xs text-slate-500" aria-live="polite">
        Showing <span className="font-medium text-slate-700">{start}</span>–
        <span className="font-medium text-slate-700">{end}</span> of{" "}
        <span className="font-medium text-slate-700">{totalResults}</span> tickets
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={navBtn}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Previous
        </button>
        <span className="px-1 text-xs text-slate-500">
          Page <span className="font-medium text-slate-700">{page}</span> of {pageCount}
        </span>
        <button
          type="button"
          className={navBtn}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
        >
          Next
          <ChevronRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    </div>
  );
}
