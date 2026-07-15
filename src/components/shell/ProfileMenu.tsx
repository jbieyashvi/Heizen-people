"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { DemoRole, Employee } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { useRole } from "@/lib/roles/RoleContext";
import { ROLE_OPTIONS } from "@/lib/roles/roles";

export interface ProfileLink {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

interface ProfileMenuProps {
  open: boolean;
  onClose: () => void;
  user: Employee;
  links: ProfileLink[];
}

export function ProfileMenu({ open, onClose, user, links }: ProfileMenuProps) {
  const router = useRouter();
  const { role, setRole } = useRole();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function switchRole(value: DemoRole, home: string) {
    setRole(value);
    onClose();
    router.push(home);
  }

  return (
    <div
      role="menu"
      aria-label="Profile menu"
      className="absolute right-0 top-11 z-50 w-64 overflow-hidden rounded-lg border border-[#EAECEE] bg-white shadow-panel"
    >
      <div className="flex items-center gap-2.5 border-b border-[#EAECEE] px-3.5 py-3">
        <Avatar initials={user.initials} />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-slate-800">{user.name}</span>
          <span className="truncate text-xs text-slate-400">{user.email}</span>
        </span>
      </div>

      <div className="p-1.5">
        {links.map((link) => {
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
      </div>

      {/* Prototype-only role switcher — clearly separated from production nav. */}
      <div className="border-t border-dashed border-[#E3E6E8] bg-surface-muted/60 p-1.5">
        <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Prototype · View as
        </p>
        {ROLE_OPTIONS.map((opt) => {
          const active = role === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="menuitemradio"
              aria-checked={active}
              disabled={opt.disabled}
              onClick={() => switchRole(opt.value, opt.home)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-sm outline-none",
                opt.disabled
                  ? "cursor-not-allowed text-slate-300"
                  : "text-slate-600 hover:bg-white hover:text-slate-900 focus-visible:bg-white",
                active && "font-medium text-heizen-700",
              )}
            >
              <span className="flex items-center gap-2">
                {opt.label}
                {opt.disabled && opt.disabledNote && (
                  <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {opt.disabledNote}
                  </span>
                )}
              </span>
              {active && <Check className="h-4 w-4 text-heizen-600" strokeWidth={2} aria-hidden />}
            </button>
          );
        })}
      </div>

      <div className="border-t border-[#EAECEE] p-1.5">
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
