import {
  Users,
  Wallet,
  CalendarDays,
  Monitor,
  Building2,
  Laptop,
  ShieldCheck,
  FileBadge,
} from "lucide-react";
import type { RequestCategory } from "@/lib/types";

/** Popular request categories the employee can raise tickets against. */
export const requestCategories: RequestCategory[] = [
  {
    key: "hr",
    label: "HR",
    description: "Policies, records and general HR help",
    icon: Users,
    href: "/support/new?category=hr",
  },
  {
    key: "payroll",
    label: "Payroll",
    description: "Salary, payslips and reimbursements",
    icon: Wallet,
    href: "/support/new?category=payroll",
  },
  {
    key: "leave",
    label: "Leave",
    description: "Leave balance, approvals and queries",
    icon: CalendarDays,
    href: "/support/new?category=leave",
  },
  {
    key: "it-support",
    label: "IT Support",
    description: "Accounts, access and software issues",
    icon: Monitor,
    href: "/support/new?category=it-support",
  },
  {
    key: "administration",
    label: "Administration",
    description: "Facilities, travel and office requests",
    icon: Building2,
    href: "/support/new?category=administration",
  },
  {
    key: "assets",
    label: "Assets",
    description: "Laptops, hardware and equipment",
    icon: Laptop,
    href: "/support/new?category=assets",
  },
  {
    key: "compliance",
    label: "Compliance",
    description: "Audits, disclosures and policy sign-offs",
    icon: ShieldCheck,
    href: "/support/new?category=compliance",
  },
  {
    key: "employment-documents",
    label: "Employment Documents",
    description: "Letters, verifications and certificates",
    icon: FileBadge,
    href: "/support/new?category=employment-documents",
  },
];
