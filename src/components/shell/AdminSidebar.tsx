"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/cn";
import { adminNav, type AdminNavItem } from "@/lib/data/adminNavigation";
import { currentAdmin } from "@/lib/roles/roles";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/Avatar";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin/dashboard") return pathname === "/admin/dashboard" || pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, collapsed, active }: { item: AdminNavItem; collapsed: boolean; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-1",
        active ? "bg-heizen-50 text-heizen-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        collapsed && "justify-center",
      )}
    >
      <Icon
        className={cn("h-[18px] w-[18px] shrink-0", active ? "text-heizen-600" : "text-slate-400 group-hover:text-slate-600")}
        strokeWidth={1.75}
        aria-hidden
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-[#EAECEE] bg-white transition-[width] duration-200",
        collapsed ? "w-[68px]" : "w-64",
      )}
    >
      <div className={cn("flex h-16 items-center border-b border-[#EAECEE] px-3", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && <Logo />}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 outline-none hover:bg-slate-50 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-heizen-400"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
          ) : (
            <PanelLeftClose className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
          )}
        </button>
      </div>

      {!collapsed && (
        <p className="px-4 pt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Admin Workspace</p>
      )}

      <nav className="flex flex-1 flex-col gap-3 overflow-y-auto p-2.5" aria-label="Admin">
        {adminNav.map((section) => (
          <div key={section.title} className="flex flex-col gap-1">
            {!collapsed && (
              <p className="px-2.5 pb-0.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {section.title}
              </p>
            )}
            {section.items.map((item) => (
              <NavLink key={item.key} item={item} collapsed={collapsed} active={isActive(pathname, item.href)} />
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-[#EAECEE] p-2.5">
        <div className={cn("flex items-center gap-2.5 rounded-md p-1.5", collapsed && "justify-center")}>
          <Avatar initials={currentAdmin.initials} />
          {!collapsed && (
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-slate-800">{currentAdmin.name}</span>
              <span className="truncate text-xs text-slate-400">Organization-wide</span>
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
