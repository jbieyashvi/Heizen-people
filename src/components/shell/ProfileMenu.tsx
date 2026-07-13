"use client";

import { useEffect } from "react";
import Link from "next/link";
import { UserRound, Settings, LogOut } from "lucide-react";
import { currentEmployee } from "@/lib/data/employee";
import { Avatar } from "@/components/ui/Avatar";

interface ProfileMenuProps {
  open: boolean;
  onClose: () => void;
}

const MENU_LINKS = [
  { key: "profile", label: "My Profile", href: "/profile", icon: UserRound },
  { key: "settings", label: "Settings", href: "/settings", icon: Settings },
];

export function ProfileMenu({ open, onClose }: ProfileMenuProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="menu"
      aria-label="Profile menu"
      className="absolute right-0 top-11 z-50 w-60 overflow-hidden rounded-lg border border-[#EAECEE] bg-white shadow-panel"
    >
      <div className="flex items-center gap-2.5 border-b border-[#EAECEE] px-3.5 py-3">
        <Avatar initials={currentEmployee.initials} />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-slate-800">{currentEmployee.name}</span>
          <span className="truncate text-xs text-slate-400">{currentEmployee.email}</span>
        </span>
      </div>
      <div className="p-1.5">
        {MENU_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.key}
              href={link.href}
              role="menuitem"
              onClick={onClose}
              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-slate-600 outline-none hover:bg-slate-50 hover:text-slate-900 focus-visible:bg-slate-50"
            >
              <Icon className="h-[18px] w-[18px] text-slate-400" strokeWidth={1.75} aria-hidden />
              {link.label}
            </Link>
          );
        })}
        <div className="my-1.5 border-t border-[#EAECEE]" />
        <button
          type="button"
          role="menuitem"
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-slate-600 outline-none hover:bg-slate-50 hover:text-slate-900 focus-visible:bg-slate-50"
        >
          <LogOut className="h-[18px] w-[18px] text-slate-400" strokeWidth={1.75} aria-hidden />
          Sign out
        </button>
      </div>
    </div>
  );
}
