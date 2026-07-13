/** Maps a pathname to the title shown in the sticky top header. */
const TITLES: Array<{ match: (path: string) => boolean; title: string }> = [
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
