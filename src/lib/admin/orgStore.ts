import type { OrgConfig } from "@/lib/admin/orgTypes";
import { cloneSeedConfig } from "@/lib/admin/orgConfig";

const KEY = "heizen.people.orgConfig.v1";

/** Read the org config (persisted admin edits, or seed defaults). SSR-safe. */
export function getOrgConfig(): OrgConfig {
  if (typeof window === "undefined") return cloneSeedConfig();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return cloneSeedConfig();
    const parsed = JSON.parse(raw) as OrgConfig;
    if (!parsed || !Array.isArray(parsed.departments) || !Array.isArray(parsed.teams) || !Array.isArray(parsed.members)) {
      return cloneSeedConfig();
    }
    return parsed;
  } catch {
    return cloneSeedConfig();
  }
}

export function saveOrgConfig(config: OrgConfig): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(config));
  } catch {
    // Storage may be unavailable — ignore.
  }
}
