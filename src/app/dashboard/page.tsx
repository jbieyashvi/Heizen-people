import { LayoutDashboard } from "lucide-react";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export default function DashboardPage() {
  return (
    <PagePlaceholder
      icon={LayoutDashboard}
      title="Dashboard"
      description="Your personalised employee home will live here. For now, head to the Support Center to raise and track requests."
    />
  );
}
