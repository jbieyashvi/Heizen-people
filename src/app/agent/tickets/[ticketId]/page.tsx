import { AgentTicketDetailView } from "@/components/agent/detail/AgentTicketDetailView";
import { seedTickets } from "@/lib/data/seedTickets";

// Static export: pre-render the known seed tickets. Runtime tickets resolve
// client-side from localStorage.
export function generateStaticParams() {
  return seedTickets.map((t) => ({ ticketId: t.id }));
}

export default async function AgentTicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;
  return <AgentTicketDetailView ticketId={decodeURIComponent(ticketId)} />;
}
