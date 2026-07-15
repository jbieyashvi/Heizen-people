import type { CategoryConfig } from "@/lib/admin/categoryTypes";
import { CATEGORY_CONFIG_VERSION, cloneSeedCategoryConfig } from "@/lib/admin/categoryConfig";

const KEY = "heizen.people.categoryConfig.v1";

/** Read category config (persisted admin edits or seed). SSR-safe + migrates. */
export function getCategoryConfig(): CategoryConfig {
  if (typeof window === "undefined") return cloneSeedCategoryConfig();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return cloneSeedCategoryConfig();
    const parsed = JSON.parse(raw) as CategoryConfig;
    if (!parsed || !Array.isArray(parsed.categories)) return cloneSeedCategoryConfig();
    // Migration hook: if a future seed bumps the version, fall back to seed.
    if (typeof parsed.version !== "number" || parsed.version > CATEGORY_CONFIG_VERSION) {
      return cloneSeedCategoryConfig();
    }
    return parsed;
  } catch {
    return cloneSeedCategoryConfig();
  }
}

export function saveCategoryConfig(config: CategoryConfig): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}
