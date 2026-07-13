import { FileText } from "lucide-react";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export default function DocumentsPage() {
  return (
    <PagePlaceholder
      icon={FileText}
      title="Documents"
      description="Payslips, letters and personal documents will be available here soon."
      comingSoon
    />
  );
}
