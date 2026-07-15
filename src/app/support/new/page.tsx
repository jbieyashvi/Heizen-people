import { RaiseTicketFlow } from "@/components/support/new/RaiseTicketFlow";

export default async function RaiseTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { category } = await searchParams;
  const initial = Array.isArray(category) ? category[0] : (category ?? null);
  return <RaiseTicketFlow initialCategory={initial ?? null} />;
}
