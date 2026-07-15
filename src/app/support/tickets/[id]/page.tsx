import { TicketDetailView } from "@/components/support/tickets/detail/TicketDetailView";
import { seedTickets } from "@/lib/data/seedTickets";

// Static export: pre-render the known seed tickets. Tickets created at runtime
// live in localStorage and are resolved client-side by the detail view.
export function generateStaticParams() {
  return seedTickets.map((t) => ({ id: t.id }));
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TicketDetailView ticketId={decodeURIComponent(id)} />;
}
