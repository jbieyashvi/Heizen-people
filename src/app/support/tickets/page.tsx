import { Suspense } from "react";
import { MyTicketsView } from "@/components/support/tickets/MyTicketsView";
import { TicketsTableSkeleton } from "@/components/support/tickets/TicketsTableSkeleton";

export default function MyTicketsPage() {
  return (
    <Suspense fallback={<TicketsTableSkeleton />}>
      <MyTicketsView />
    </Suspense>
  );
}
