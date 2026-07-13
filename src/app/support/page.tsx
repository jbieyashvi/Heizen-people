import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WelcomeHeader } from "@/components/support/WelcomeHeader";
import { QuickSearch } from "@/components/support/QuickSearch";
import { StatusSummary } from "@/components/support/StatusSummary";
import { ActionRequired } from "@/components/support/ActionRequired";
import { CategoryGrid } from "@/components/support/CategoryGrid";
import { RecentTickets } from "@/components/support/RecentTickets";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function SupportCenterPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* A. Welcome */}
      <WelcomeHeader />

      {/* B. Quick search */}
      <QuickSearch />

      {/* C. Ticket status summary */}
      <section aria-label="Ticket status summary" className="flex flex-col gap-3">
        <SectionHeading title="Your tickets at a glance" />
        <StatusSummary />
      </section>

      {/* D. Action required */}
      <ActionRequired />

      {/* E. Popular request categories */}
      <section aria-label="Popular request categories" className="flex flex-col gap-3">
        <SectionHeading title="Popular request categories" />
        <CategoryGrid />
      </section>

      {/* F. Recent tickets */}
      <section aria-label="Recent tickets" className="flex flex-col gap-3">
        <SectionHeading
          title="Recent tickets"
          action={
            <Link
              href="/support/tickets"
              className="inline-flex items-center gap-1 rounded-md text-sm font-medium text-heizen-700 outline-none hover:text-heizen-800 focus-visible:ring-2 focus-visible:ring-heizen-400"
            >
              View All Tickets
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </Link>
          }
        />
        <RecentTickets />
      </section>
    </div>
  );
}
