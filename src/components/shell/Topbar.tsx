"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { currentEmployee } from "@/lib/data/employee";
import { unreadCount } from "@/lib/data/notifications";
import { Avatar } from "@/components/ui/Avatar";
import { NotificationPanel } from "@/components/shell/NotificationPanel";
import { ProfileMenu } from "@/components/shell/ProfileMenu";

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) setNotifOpen(false);
      if (menuRef.current && !menuRef.current.contains(target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-[#EAECEE] bg-white/95 px-5 backdrop-blur">
      <h1 className="shrink-0 text-base font-semibold text-slate-800">{title}</h1>

      {/* Global search */}
      <div className="ml-2 hidden max-w-md flex-1 sm:block">
        <label htmlFor="global-search" className="sr-only">
          Global search
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            strokeWidth={1.75}
            aria-hidden
          />
          <input
            id="global-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="h-9 w-full rounded-md border border-[#EAECEE] bg-surface-muted pl-9 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-heizen-300 focus:bg-white focus:ring-2 focus:ring-heizen-100"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setNotifOpen((v) => !v);
              setMenuOpen(false);
            }}
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
            aria-haspopup="dialog"
            aria-expanded={notifOpen}
            className="relative flex h-9 w-9 items-center justify-center rounded-md text-slate-500 outline-none hover:bg-slate-50 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-heizen-400"
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
            {unreadCount > 0 && (
              <span
                className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-amber-500"
                aria-hidden
              />
            )}
          </button>
          <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>

        {/* Profile menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => {
              setMenuOpen((v) => !v);
              setNotifOpen(false);
            }}
            aria-label="Open profile menu"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className={cn(
              "flex items-center gap-2 rounded-md py-1 pl-1 pr-2 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-heizen-400",
            )}
          >
            <Avatar initials={currentEmployee.initials} />
            <span className="hidden text-sm font-medium text-slate-700 md:block">
              {currentEmployee.firstName}
            </span>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" strokeWidth={1.75} aria-hidden />
          </button>
          <ProfileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
        </div>
      </div>
    </header>
  );
}
