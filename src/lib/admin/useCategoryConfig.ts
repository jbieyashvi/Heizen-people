"use client";

import { useCallback, useEffect, useState } from "react";
import type { TicketRecord } from "@/lib/types";
import type { Category, CategoryConfig, RequestType } from "@/lib/admin/categoryTypes";
import { getCategoryConfig, saveCategoryConfig } from "@/lib/admin/categoryStore";
import { addAdminActivity } from "@/lib/admin/adminActivity";
import { getAllTicketRecords } from "@/lib/support/ticketService";

type LoadState = "loading" | "ready" | "error";

function genId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  return `${prefix}-${Date.now().toString(36)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

type NewCategory = Omit<Category, "id" | "requestTypes" | "createdAt" | "updatedAt" | "order">;
type NewRequestType = Omit<RequestType, "id" | "createdAt" | "updatedAt" | "order">;

export interface UseCategoryConfigResult {
  config: CategoryConfig;
  tickets: TicketRecord[];
  state: LoadState;
  reload: () => void;

  addCategory: (c: NewCategory) => void;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  setCategoryStatus: (id: string, status: Category["status"]) => void;
  setCategoryVisibility: (id: string, visibility: Category["visibility"]) => void;
  moveCategory: (id: string, dir: "up" | "down") => void;

  addRequestType: (catId: string, rt: NewRequestType) => void;
  updateRequestType: (catId: string, rtId: string, patch: Partial<RequestType>) => void;
  setRequestTypeStatus: (catId: string, rtId: string, status: RequestType["status"]) => void;
  moveRequestType: (catId: string, rtId: string, dir: "up" | "down") => void;
}

function reorder<T extends { id: string; order: number }>(items: T[], id: string, dir: "up" | "down"): T[] {
  const sorted = [...items].sort((a, b) => a.order - b.order);
  const idx = sorted.findIndex((x) => x.id === id);
  const swap = dir === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swap < 0 || swap >= sorted.length) return items;
  const a = sorted[idx];
  const b = sorted[swap];
  return items.map((x) => (x.id === a.id ? { ...x, order: b.order } : x.id === b.id ? { ...x, order: a.order } : x));
}

export function useCategoryConfig(): UseCategoryConfigResult {
  const [config, setConfig] = useState<CategoryConfig>({ version: 1, categories: [] });
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [state, setState] = useState<LoadState>("loading");

  const load = useCallback(() => {
    setState("loading");
    try {
      setConfig(getCategoryConfig());
      setTickets(getAllTicketRecords());
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(load, 150);
    return () => window.clearTimeout(timer);
  }, [load]);

  const commit = useCallback((produce: (cur: CategoryConfig) => { next: CategoryConfig; action: string; entity: string }) => {
    const cur = getCategoryConfig();
    const { next, action, entity } = produce(cur);
    saveCategoryConfig(next);
    addAdminActivity(action, entity);
    setConfig(next);
  }, []);

  const patchCategory = (cur: CategoryConfig, id: string, fn: (c: Category) => Category): CategoryConfig => ({
    ...cur,
    categories: cur.categories.map((c) => (c.id === id ? fn(c) : c)),
  });

  const addCategory = useCallback((c: NewCategory) => {
    commit((cur) => {
      const order = Math.max(0, ...cur.categories.map((x) => x.order)) + 1;
      const cat: Category = { ...c, id: genId("CAT"), order, requestTypes: [], createdAt: nowIso(), updatedAt: nowIso() };
      return { next: { ...cur, categories: [...cur.categories, cat] }, action: "Category created", entity: c.name };
    });
  }, [commit]);

  const updateCategory = useCallback((id: string, patch: Partial<Category>) => {
    commit((cur) => {
      const prev = cur.categories.find((c) => c.id === id);
      const routingChanged = prev && ((patch.departmentId && patch.departmentId !== prev.departmentId) || (patch.teamId && patch.teamId !== prev.teamId));
      const action = routingChanged ? "Category routing changed" : "Category edited";
      return { next: patchCategory(cur, id, (c) => ({ ...c, ...patch, updatedAt: nowIso() })), action, entity: patch.name ?? prev?.name ?? id };
    });
  }, [commit]);

  const setCategoryStatus = useCallback((id: string, status: Category["status"]) => {
    commit((cur) => {
      const prev = cur.categories.find((c) => c.id === id);
      return { next: patchCategory(cur, id, (c) => ({ ...c, status, updatedAt: nowIso() })), action: status === "Active" ? "Category activated" : "Category deactivated", entity: prev?.name ?? id };
    });
  }, [commit]);

  const setCategoryVisibility = useCallback((id: string, visibility: Category["visibility"]) => {
    commit((cur) => {
      const prev = cur.categories.find((c) => c.id === id);
      return { next: patchCategory(cur, id, (c) => ({ ...c, visibility, updatedAt: nowIso() })), action: `Category visibility set to ${visibility}`, entity: prev?.name ?? id };
    });
  }, [commit]);

  const moveCategory = useCallback((id: string, dir: "up" | "down") => {
    commit((cur) => ({ next: { ...cur, categories: reorder(cur.categories, id, dir) }, action: "Categories reordered", entity: cur.categories.find((c) => c.id === id)?.name ?? id }));
  }, [commit]);

  const addRequestType = useCallback((catId: string, rt: NewRequestType) => {
    commit((cur) => {
      const cat = cur.categories.find((c) => c.id === catId);
      const order = Math.max(0, ...(cat?.requestTypes.map((x) => x.order) ?? [])) + 1;
      const item: RequestType = { ...rt, id: genId(`${catId}-rt`), order, createdAt: nowIso(), updatedAt: nowIso() };
      return { next: patchCategory(cur, catId, (c) => ({ ...c, requestTypes: [...c.requestTypes, item], updatedAt: nowIso() })), action: "Request type created", entity: `${rt.name} · ${cat?.name ?? catId}` };
    });
  }, [commit]);

  const updateRequestType = useCallback((catId: string, rtId: string, patch: Partial<RequestType>) => {
    commit((cur) => {
      const cat = cur.categories.find((c) => c.id === catId);
      const prev = cat?.requestTypes.find((r) => r.id === rtId);
      return { next: patchCategory(cur, catId, (c) => ({ ...c, requestTypes: c.requestTypes.map((r) => (r.id === rtId ? { ...r, ...patch, updatedAt: nowIso() } : r)) })), action: "Request type edited", entity: `${patch.name ?? prev?.name ?? rtId} · ${cat?.name ?? catId}` };
    });
  }, [commit]);

  const setRequestTypeStatus = useCallback((catId: string, rtId: string, status: RequestType["status"]) => {
    commit((cur) => {
      const cat = cur.categories.find((c) => c.id === catId);
      const prev = cat?.requestTypes.find((r) => r.id === rtId);
      return { next: patchCategory(cur, catId, (c) => ({ ...c, requestTypes: c.requestTypes.map((r) => (r.id === rtId ? { ...r, status, updatedAt: nowIso() } : r)) })), action: status === "Active" ? "Request type activated" : "Request type deactivated", entity: `${prev?.name ?? rtId} · ${cat?.name ?? catId}` };
    });
  }, [commit]);

  const moveRequestType = useCallback((catId: string, rtId: string, dir: "up" | "down") => {
    commit((cur) => ({ next: patchCategory(cur, catId, (c) => ({ ...c, requestTypes: reorder(c.requestTypes, rtId, dir) })), action: "Request types reordered", entity: cur.categories.find((c) => c.id === catId)?.name ?? catId }));
  }, [commit]);

  return {
    config, tickets, state, reload: load,
    addCategory, updateCategory, setCategoryStatus, setCategoryVisibility, moveCategory,
    addRequestType, updateRequestType, setRequestTypeStatus, moveRequestType,
  };
}
