import { Suspense } from "react";
import { AdminOverview } from "@/components/admin/AdminOverview";

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-slate-100" />}>
      <AdminOverview />
    </Suspense>
  );
}
