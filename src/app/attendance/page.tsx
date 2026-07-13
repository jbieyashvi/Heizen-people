import { CalendarClock } from "lucide-react";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export default function AttendancePage() {
  return (
    <PagePlaceholder
      icon={CalendarClock}
      title="Attendance"
      description="Clock-ins, shifts and attendance summaries will be available here soon."
      comingSoon
    />
  );
}
