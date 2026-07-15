import Link from "next/link";
import { ArrowLeft, Wrench } from "lucide-react";

export function AdminPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/admin/dashboard"
        className="inline-flex w-fit items-center gap-1.5 rounded-md text-sm font-medium text-slate-500 outline-none hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-heizen-400"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        Back to Admin Overview
      </Link>

      <div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-[#DDE1E4] bg-white px-6 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#EAECEE] bg-surface-muted text-slate-400">
          <Wrench className="h-6 w-6" strokeWidth={1.5} aria-hidden />
        </span>
        <p className="max-w-md text-sm text-slate-500">Configuration interface will be added in the next step.</p>
      </div>
    </div>
  );
}
