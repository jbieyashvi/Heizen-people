import { DEFAULT_RANGE, type RangeKey } from "@/lib/admin/dateRange";
import { ORG_TEAMS } from "@/lib/roles/roles";
import { ADMIN_CATEGORIES } from "@/lib/admin/analytics";

export interface AdminFilterState {
  range: RangeKey;
  /** Custom range bounds (yyyy-mm-dd), only used when range === "custom". */
  from: string;
  to: string;
  team: string; // "all" | team
  category: string; // "all" | category
}

export const DEFAULT_FILTERS: AdminFilterState = {
  range: DEFAULT_RANGE,
  from: "",
  to: "",
  team: "all",
  category: "all",
};

const RANGES: RangeKey[] = ["7d", "30d", "90d", "year", "custom"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

interface Readable {
  get(key: string): string | null;
}

export function parseFilters(p: Readable): AdminFilterState {
  const range = p.get("range") as RangeKey | null;
  const team = p.get("team");
  const category = p.get("category");
  const from = p.get("from");
  const to = p.get("to");
  return {
    range: range && RANGES.includes(range) ? range : DEFAULT_RANGE,
    from: from && DATE_RE.test(from) ? from : "",
    to: to && DATE_RE.test(to) ? to : "",
    team: team && ORG_TEAMS.includes(team) ? team : "all",
    category: category && ADMIN_CATEGORIES.includes(category) ? category : "all",
  };
}

export function buildQueryString(f: AdminFilterState): string {
  const p = new URLSearchParams();
  if (f.range !== DEFAULT_RANGE) p.set("range", f.range);
  if (f.range === "custom" && f.from) p.set("from", f.from);
  if (f.range === "custom" && f.to) p.set("to", f.to);
  if (f.team !== "all") p.set("team", f.team);
  if (f.category !== "all") p.set("category", f.category);
  return p.toString();
}

export function hasActiveFilters(f: AdminFilterState): boolean {
  return f.range !== DEFAULT_RANGE || f.team !== "all" || f.category !== "all";
}
