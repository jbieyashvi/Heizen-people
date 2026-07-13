import { Plane } from "lucide-react";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export default function LeavesPage() {
  return (
    <PagePlaceholder
      icon={Plane}
      title="Leaves"
      description="Leave balances, requests and approvals will be available here soon."
      comingSoon
    />
  );
}
