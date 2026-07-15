import {
  LayoutDashboard,
  Layers,
  Building2,
  Tags,
  Gauge,
  Users,
  GitBranch,
  BellRing,
  Mail,
  BarChart3,
  ShieldCheck,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AdminNavItem {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

/** Admin workspace navigation, grouped into logical sections. */
export const adminNav: AdminNavSection[] = [
  {
    title: "Overview",
    items: [
      { key: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { key: "all-tickets", label: "All Tickets", href: "/admin/tickets", icon: Layers },
    ],
  },
  {
    title: "Configuration",
    items: [
      { key: "departments", label: "Departments", href: "/admin/departments", icon: Building2 },
      { key: "categories", label: "Categories & Request Types", href: "/admin/categories", icon: Tags },
      { key: "sla", label: "SLA & Priorities", href: "/admin/sla", icon: Gauge },
      { key: "support-teams", label: "Support Teams", href: "/admin/support-teams", icon: Users },
      { key: "assignment-rules", label: "Assignment Rules", href: "/admin/assignment-rules", icon: GitBranch },
    ],
  },
  {
    title: "Communication",
    items: [
      { key: "notifications", label: "Notification Rules", href: "/admin/notifications", icon: BellRing },
      { key: "email-templates", label: "Email Templates", href: "/admin/email-templates", icon: Mail },
    ],
  },
  {
    title: "Insights & Access",
    items: [
      { key: "reports", label: "Reports", href: "/admin/reports", icon: BarChart3 },
      { key: "permissions", label: "Roles & Permissions", href: "/admin/permissions", icon: ShieldCheck },
      { key: "settings", label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];
