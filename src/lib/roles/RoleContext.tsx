"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { DemoRole } from "@/lib/types";
import { getStoredRole, setStoredRole } from "@/lib/roles/roles";

interface RoleContextValue {
  role: DemoRole;
  /** True once the persisted role has been read on the client (avoids flicker). */
  ready: boolean;
  setRole: (role: DemoRole) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<DemoRole>("employee");
  const [ready, setReady] = useState(false);

  // Read persisted role after mount (localStorage is client-only).
  useEffect(() => {
    setRoleState(getStoredRole());
    setReady(true);
  }, []);

  const setRole = useCallback((next: DemoRole) => {
    setStoredRole(next);
    setRoleState(next);
  }, []);

  return (
    <RoleContext.Provider value={{ role, ready, setRole }}>{children}</RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within a RoleProvider");
  return ctx;
}
