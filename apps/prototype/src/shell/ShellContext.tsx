'use client';
// Lets a page choose the sidebar state the design uses for it: list pages expanded, detail pages,
// wizards and workspaces collapsed (pattern in every designs/ module). The user can still toggle it.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface ShellCtx { collapsed: boolean; setCollapsed: (v: boolean) => void }
const Ctx = createContext<ShellCtx>({ collapsed: false, setCollapsed: () => {} });

export function ShellProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return <Ctx.Provider value={{ collapsed, setCollapsed }}>{children}</Ctx.Provider>;
}

export function useShell() { return useContext(Ctx); }

/** Call at the top of a page: `useSidebar('collapsed')` for detail pages, `useSidebar('expanded')` for lists. */
export function useSidebar(mode: 'collapsed' | 'expanded') {
  const { setCollapsed } = useShell();
  useEffect(() => { setCollapsed(mode === 'collapsed'); }, [mode, setCollapsed]);
}
