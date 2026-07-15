import {
  LayoutDashboard,
  UserRound,
  CalendarClock,
  Plane,
  FileText,
  LifeBuoy,
  Settings,
  Ticket,
} from "lucide-react";
import type { NavItem } from "@/lib/types";

/** Primary employee-side navigation for the application shell. */
export const primaryNav: NavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "profile", label: "My Profile", href: "/profile", icon: UserRound },
  {
    key: "attendance",
    label: "Attendance",
    href: "/attendance",
    icon: CalendarClock,
    comingSoon: true,
  },
  { key: "leaves", label: "Leaves", href: "/leaves", icon: Plane, comingSoon: true },
  {
    key: "documents",
    label: "Documents",
    href: "/documents",
    icon: FileText,
    comingSoon: true,
  },
  {
    key: "support",
    label: "Support Center",
    href: "/support",
    icon: LifeBuoy,
    children: [
      { key: "my-tickets", label: "My Tickets", href: "/support/tickets", icon: Ticket },
    ],
  },
];

export const secondaryNav: NavItem[] = [
  { key: "settings", label: "Settings", href: "/settings", icon: Settings },
];
