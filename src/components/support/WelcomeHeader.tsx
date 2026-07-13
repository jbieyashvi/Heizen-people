import Link from "next/link";
import { Plus } from "lucide-react";
import { currentEmployee } from "@/lib/data/employee";

export function WelcomeHeader() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Hello, {currentEmployee.firstName}
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">How can we help you today?</p>
      </div>
      <Link
        href="/support/new"
        className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md bg-heizen-500 px-3.5 text-sm font-medium text-white outline-none transition-colors hover:bg-heizen-600 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-2"
      >
        <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
        Raise New Ticket
      </Link>
    </div>
  );
}
