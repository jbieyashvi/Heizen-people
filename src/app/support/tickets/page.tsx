import { Ticket } from "lucide-react";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export default function MyTicketsPage() {
  return (
    <PagePlaceholder
      icon={Ticket}
      title="My Tickets"
      description="A full, filterable list of all your support tickets will live here. For now, your most recent tickets are shown on the Support Center dashboard."
      backHref="/support"
      backLabel="Back to Support Center"
    />
  );
}
