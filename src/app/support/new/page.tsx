"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RaiseTicketFlow } from "@/components/support/new/RaiseTicketFlow";

function RaiseTicketInner() {
  // Read the preselected category on the client so the page stays static-exportable.
  const category = useSearchParams().get("category");
  return <RaiseTicketFlow initialCategory={category} />;
}

export default function RaiseTicketPage() {
  return (
    <Suspense fallback={null}>
      <RaiseTicketInner />
    </Suspense>
  );
}
