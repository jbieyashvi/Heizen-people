import {
  LayoutDashboard,
  Inbox,
  Layers,
  CircleDashed,
  AlarmClock,
  Flame,
  History,
  BarChart3,
} from "lucide-react";
import type { NavItem } from "@/lib/types";

/**
 * Support Agent workspace navigation. Queue links carry the queue in the URL so
 * /agent/tickets can read and apply the filter. No employee-only items appear
 * here (My Profile / Attendance / Leave are intentionally absent).
 */
export const agentNav: NavItem[] = [
  { key: "overview", label: "Overview", href: "/agent/dashboard", icon: LayoutDashboard },
  { key: "my-tickets", label: "My Tickets", href: "/agent/tickets?queue=my-tickets", icon: Inbox },
  { key: "all", label: "All Tickets", href: "/agent/tickets?queue=all", icon: Layers },
  { key: "unassigned", label: "Unassigned Tickets", href: "/agent/tickets?queue=unassigned", icon: CircleDashed },
  { key: "overdue", label: "Overdue Tickets", href: "/agent/tickets?queue=overdue", icon: AlarmClock },
  { key: "high-priority", label: "High Priority", href: "/agent/tickets?queue=high-priority", icon: Flame },
  { key: "recently-updated", label: "Recently Updated", href: "/agent/tickets?queue=recently-updated", icon: History },
  { key: "reports", label: "Reports", href: "/agent/reports", icon: BarChart3, comingSoon: true },
];
