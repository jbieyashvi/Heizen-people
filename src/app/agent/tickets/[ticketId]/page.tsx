import { AgentTicketDetailView } from "@/components/agent/detail/AgentTicketDetailView";

export default async function AgentTicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;
  return <AgentTicketDetailView ticketId={decodeURIComponent(ticketId)} />;
}
