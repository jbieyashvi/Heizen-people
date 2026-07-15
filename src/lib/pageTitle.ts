/** Maps a pathname to the title shown in the sticky top header. */
const TITLES: Array<{ match: (path: string) => boolean; title: string }> = [
  { match: (p) => p.startsWith("/admin/dashboard") || p === "/admin", title: "Admin Overview" },
  { match: (p) => p.startsWith("/admin/tickets"), title: "All Tickets" },
  { match: (p) => p.startsWith("/admin"), title: "Admin" },
  { match: (p) => p.startsWith("/agent/tickets"), title: "Agent Tickets" },
  { match: (p) => p.startsWith("/agent/dashboard") || p === "/agent", title: "Support Overview" },
  { match: (p) => p.startsWith("/agent"), title: "Support Workspace" },
  { match: (p) => p === "/support" || p === "/", title: "Support Center" },
  { match: (p) => p.startsWith("/support/tickets"), title: "My Tickets" },
  { match: (p) => p.startsWith("/support/new"), title: "Raise New Ticket" },
  { match: (p) => p.startsWith("/support"), title: "Support Center" },
  { match: (p) => p.startsWith("/dashboard"), title: "Dashboard" },
  { match: (p) => p.startsWith("/profile"), title: "My Profile" },
  { match: (p) => p.startsWith("/attendance"), title: "Attendance" },
  { match: (p) => p.startsWith("/leaves"), title: "Leaves" },
  { match: (p) => p.startsWith("/documents"), title: "Documents" },
  { match: (p) => p.startsWith("/settings"), title: "Settings" },
];

export function getPageTitle(pathname: string): string {
  return TITLES.find((t) => t.match(pathname))?.title ?? "Heizen People";
}
