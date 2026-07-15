"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserRound, Settings } from "lucide-react";
import { getPageTitle } from "@/lib/pageTitle";
import { RoleProvider, useRole } from "@/lib/roles/RoleContext";
import { currentAgent, currentAdmin } from "@/lib/roles/roles";
import { currentEmployee } from "@/lib/data/employee";
import { Sidebar } from "@/components/shell/Sidebar";
import { AgentSidebar } from "@/components/shell/AgentSidebar";
import { AdminSidebar } from "@/components/shell/AdminSidebar";
import { Topbar } from "@/components/shell/Topbar";

const EMPLOYEE_LINKS = [
  { key: "profile", label: "My Profile", href: "/profile", icon: UserRound },
  { key: "settings", label: "Settings", href: "/settings", icon: Settings },
];
const AGENT_LINKS = [{ key: "settings", label: "Settings", href: "/settings", icon: Settings }];
const ADMIN_LINKS = [{ key: "settings", label: "Settings", href: "/admin/settings", icon: Settings }];

function ShellInner({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { role, ready } = useRole();

  const isAgentArea = pathname.startsWith("/agent");
  const isAdminArea = pathname.startsWith("/admin");
  const title = getPageTitle(pathname);

  // Lightweight prototype role guards: only the matching role may stay on the
  // agent / admin routes.
  useEffect(() => {
    if (!ready) return;
    if (isAgentArea && role !== "agent") router.replace("/support");
    else if (isAdminArea && role !== "admin") router.replace("/support");
  }, [ready, isAgentArea, isAdminArea, role, router]);

  const user = isAdminArea ? currentAdmin : isAgentArea ? currentAgent : currentEmployee;
  const profileLinks = isAdminArea ? ADMIN_LINKS : isAgentArea ? AGENT_LINKS : EMPLOYEE_LINKS;

  return (
    <div className="flex min-h-screen bg-surface-muted text-slate-800">
      {isAdminArea ? (
        <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      ) : isAgentArea ? (
        <Suspense
          fallback={<div className="sticky top-0 h-screen w-60 shrink-0 border-r border-[#EAECEE] bg-white" />}
        >
          <AgentSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
        </Suspense>
      ) : (
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} user={user} profileLinks={profileLinks} />
        <main className="flex-1 px-5 py-6 md:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

/** Application shell: role-aware sidebar + sticky header + page content. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <ShellInner>{children}</ShellInner>
    </RoleProvider>
  );
}
