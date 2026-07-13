import { UserRound } from "lucide-react";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export default function ProfilePage() {
  return (
    <PagePlaceholder
      icon={UserRound}
      title="My Profile"
      description="Your personal details, role and employment information will appear here in an upcoming release."
    />
  );
}
