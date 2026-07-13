import { RaiseTicketFlow } from "@/components/support/new/RaiseTicketFlow";
import { TICKET_CATEGORIES } from "@/lib/config/ticketForm";
import type { TicketCategoryKey } from "@/lib/types";

function resolveCategory(value: string | string[] | undefined): TicketCategoryKey | null {
  const key = Array.isArray(value) ? value[0] : value;
  return TICKET_CATEGORIES.some((c) => c.key === key)
    ? (key as TicketCategoryKey)
    : null;
}

export default async function RaiseTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { category } = await searchParams;
  return <RaiseTicketFlow initialCategory={resolveCategory(category)} />;
}
