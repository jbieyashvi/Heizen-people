"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/cn";
import { primaryNav, secondaryNav } from "@/lib/data/navigation";
import { currentEmployee } from "@/lib/data/employee";
import type { NavItem } from "@/lib/types";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/Avatar";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/support") return pathname === "/support" || pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, collapsed, active }: { item: NavItem; collapsed: boolean; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-1",
        active
          ? "bg-heizen-50 text-heizen-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        collapsed && "justify-center",
      )}
    >
      <Icon
        className={cn("h-[18px] w-[18px] shrink-0", active ? "text-heizen-600" : "text-slate-400 group-hover:text-slate-600")}
        strokeWidth={1.75}
        aria-hidden
      />
      {!collapsed && (
        <span className="flex flex-1 items-center justify-between">
          <span>{item.label}</span>
          {item.comingSoon && (
            <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Soon
            </span>
          )}
        </span>
      )}
    </Link>
  );
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-[#EAECEE] bg-white transition-[width] duration-200",
        collapsed ? "w-[68px]" : "w-60",
      )}
    >
      {/* Brand + collapse toggle */}
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

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2.5" aria-label="Primary">
        {primaryNav.map((item) => {
          const parentActive = isActive(pathname, item.href);
          const children = item.children ?? [];
          const showChildren =
            !collapsed &&
            children.length > 0 &&
            (parentActive || children.some((c) => isActive(pathname, c.href)));
          return (
            <div key={item.key} className="flex flex-col gap-1">
              <NavLink item={item} collapsed={collapsed} active={parentActive} />
              {showChildren && (
                <div className="ml-4 flex flex-col gap-1 border-l border-[#EAECEE] pl-2">
                  {children.map((child) => (
                    <NavLink
                      key={child.key}
                      item={child}
                      collapsed={collapsed}
                      active={isActive(pathname, child.href)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div className="my-2 border-t border-[#EAECEE]" />

        {secondaryNav.map((item) => (
          <NavLink key={item.key} item={item} collapsed={collapsed} active={isActive(pathname, item.href)} />
        ))}
      </nav>

      {/* Logged-in employee */}
      <div className="border-t border-[#EAECEE] p-2.5">
        <Link
          href="/profile"
          title={collapsed ? currentEmployee.name : undefined}
          className={cn(
            "flex items-center gap-2.5 rounded-md p-1.5 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400",
            collapsed && "justify-center",
          )}
        >
          <Avatar initials={currentEmployee.initials} />
          {!collapsed && (
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-slate-800">{currentEmployee.name}</span>
              <span className="truncate text-xs text-slate-400">{currentEmployee.department}</span>
            </span>
          )}
        </Link>
      </div>
    </aside>
  );
}
