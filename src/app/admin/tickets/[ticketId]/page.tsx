import { AgentTicketDetailView } from "@/components/agent/detail/AgentTicketDetailView";

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
