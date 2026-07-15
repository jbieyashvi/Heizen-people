import {
  Users,
  Wallet,
  CalendarDays,
  Monitor,
  Building2,
  Laptop,
  ShieldCheck,
  FileBadge,
  HelpCircle,
  Briefcase,
  Wrench,
  Plane,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Controlled Lucide icon list for categories (key → component). */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  users: Users,
  wallet: Wallet,
  calendar: CalendarDays,
  monitor: Monitor,
  building: Building2,
  laptop: Laptop,
  shield: ShieldCheck,
  "file-badge": FileBadge,
  "help-circle": HelpCircle,
  briefcase: Briefcase,
  wrench: Wrench,
  plane: Plane,
};

export interface IconOption {
  key: string;
  label: string;
}

export const ICON_OPTIONS: IconOption[] = [
  { key: "users", label: "People" },
  { key: "wallet", label: "Wallet" },
  { key: "calendar", label: "Calendar" },
  { key: "monitor", label: "Monitor" },
  { key: "building", label: "Building" },
  { key: "laptop", label: "Laptop" },
  { key: "shield", label: "Shield" },
  { key: "file-badge", label: "Document" },
  { key: "help-circle", label: "Help" },
  { key: "briefcase", label: "Briefcase" },
  { key: "wrench", label: "Wrench" },
  { key: "plane", label: "Travel" },
];

export function getCategoryIcon(key: string): LucideIcon {
  return CATEGORY_ICONS[key] ?? HelpCircle;
}
