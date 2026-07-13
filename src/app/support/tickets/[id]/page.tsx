import { FileText } from "lucide-react";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <PagePlaceholder
      icon={FileText}
      title={`Ticket ${id}`}
      description="The full ticket conversation, status timeline and reply box will be built in the next step. This reusable route already resolves any ticket ID."
      backHref="/support"
      backLabel="Back to Support Center"
    />
  );
}
