import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { AgentTicket } from "@/lib/types";
import { Panel } from "@/components/agent/Panel";
import { InlineEmpty } from "@/components/agent/AgentStates";
import { AgentTicketTable } from "@/components/agent/AgentTicketTable";

export function PriorityWorklist({ tickets }: { tickets: AgentTicket[] }) {
  return (
    <Panel
      title="Tickets Requiring Attention"
      bodyClassName={tickets.length === 0 ? undefined : "p-0"}
      action={
        <Link
          href="/agent/tickets?queue=all"
          className="rounded text-xs font-medium text-heizen-700 outline-none hover:text-heizen-800 focus-visible:ring-2 focus-visible:ring-heizen-400"
        >
          View all
        </Link>
      }
    >
      {tickets.length === 0 ? (
        <InlineEmpty
          icon={CheckCircle2}
          title="No urgent tickets"
          note="Nothing is breaching or approaching SLA right now."
        />
      ) : (
        <AgentTicketTable tickets={tickets} />
      )}
    </Panel>
  );
}
