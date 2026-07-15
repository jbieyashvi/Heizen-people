"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/cn";
import { agentNav } from "@/lib/data/agentNavigation";
import { currentAgent } from "@/lib/roles/roles";
import { resolveQueue } from "@/lib/agent/queues";
import type { NavItem } from "@/lib/types";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/Avatar";

interface AgentSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

/** Extract the ?queue= value from a nav href, if present. */
function queueOf(href: string): string | null {
  const q = href.split("?")[1];
  if (!q) return null;
  return new URLSearchParams(q).get("queue");
}

export function AgentSidebar({ collapsed, onToggle }: AgentSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeQueue = resolveQueue(searchParams.get("queue"));

  function isActive(item: NavItem): boolean {
    if (item.comingSoon) return false;
    const path = item.href.split("?")[0];
    if (path === "/agent/dashboard") return pathname === "/agent/dashboard";
    if (path === "/agent/tickets") {
      if (!pathname.startsWith("/agent/tickets")) return false;
      return queueOf(item.href) === activeQueue;
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  }

  return (
    <aside
      className={cn(
        "sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-[#EAECEE] bg-white transition-[width] duration-200",
        collapsed ? "w-[68px]" : "w-60",
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
        <p className="px-4 pt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Support Workspace
        </p>
      )}

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2.5" aria-label="Agent">
        {agentNav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          if (item.comingSoon) {
            return (
              <span
                key={item.key}
                title={collapsed ? item.label : undefined}
                aria-disabled
                className={cn(
                  "group flex cursor-not-allowed items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-slate-400",
                  collapsed && "justify-center",
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0 text-slate-300" strokeWidth={1.75} aria-hidden />
                {!collapsed && (
                  <span className="flex flex-1 items-center justify-between">
                    <span>{item.label}</span>
                    <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Soon
                    </span>
                  </span>
                )}
              </span>
            );
          }

          return (
            <Link
              key={item.key}
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
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Signed-in agent */}
      <div className="border-t border-[#EAECEE] p-2.5">
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-md p-1.5",
            collapsed && "justify-center",
          )}
        >
          <Avatar initials={currentAgent.initials} />
          {!collapsed && (
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-slate-800">{currentAgent.name}</span>
              <span className="truncate text-xs text-slate-400">{currentAgent.department}</span>
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
