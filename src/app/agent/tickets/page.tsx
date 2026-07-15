import { Suspense } from "react";
import { AgentQueueView } from "@/components/agent/queue/AgentQueueView";

export default function AgentTicketsPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-slate-100" />}>
      <AgentQueueView />
    </Suspense>
  );
}
