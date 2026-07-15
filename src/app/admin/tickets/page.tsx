import { Suspense } from "react";
import { AdminAllTicketsView } from "@/components/admin/AdminAllTicketsView";

export default function AdminTicketsPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-slate-100" />}>
      <AdminAllTicketsView />
    </Suspense>
  );
}
