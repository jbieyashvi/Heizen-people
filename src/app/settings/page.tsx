import { Settings } from "lucide-react";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export default function SettingsPage() {
  return (
    <PagePlaceholder
      icon={Settings}
      title="Settings"
      description="Notification preferences and account settings will be configurable here in an upcoming release."
    />
  );
}
