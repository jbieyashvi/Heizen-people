import { TicketDetailView } from "@/components/support/tickets/detail/TicketDetailView";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TicketDetailView ticketId={decodeURIComponent(id)} />;
}
