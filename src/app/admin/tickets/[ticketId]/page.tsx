import { AgentTicketDetailView } from "@/components/agent/detail/AgentTicketDetailView";
import { seedTickets } from "@/lib/data/seedTickets";

// Static export: pre-render the known seed tickets. Runtime tickets resolve
// client-side from localStorage.
export function generateStaticParams() {
  return seedTickets.map((t) => ({ ticketId: t.id }));
}

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;
  // Admin has organization-wide access — reuse the support ticket view org-wide.
  return (
    <AgentTicketDetailView
      ticketId={decodeURIComponent(ticketId)}
      orgWide
      backHref="/admin/tickets"
      overviewHref="/admin/dashboard"
    />
  );
}
