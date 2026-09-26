'use client';
// Session of the prototype: which user is signed in. Set by the sign-in screens (designs/01) or by the
// Demo switcher, which replaces Entra sign-in for quick persona changes.
// "Keep me signed in" keeps the session in localStorage; otherwise it lives in sessionStorage and ends
// with the browser tab. Nothing stored = signed out.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { sessionFor, type Session } from '@/mock';

const KEY = 'dtp-persona';
/** Fallback session object while signed out, so hooks always have a value. Never rendered: portals redirect. */
const FALLBACK = 'u-linh';

interface PersonaCtx {
  session: Session;
  /** The stored session has been read (after mount). Before that, portal pages render nothing. */
  ready: boolean;
  signedIn: boolean;
  setPersona: (userId: string, keep?: boolean) => void;
  signOut: () => void;
}
const Ctx = createContext<PersonaCtx | null>(null);

function read(): string | null {
  try { return window.sessionStorage.getItem(KEY) || window.localStorage.getItem(KEY) || null; } catch { return null; }
}

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  useEffect(() => { setUserId(read()); }, []);

  const setPersona = useCallback((id: string, keep = true) => {
    setUserId(id);
    try {
      window.sessionStorage.removeItem(KEY);
      window.localStorage.removeItem(KEY);
      (keep ? window.localStorage : window.sessionStorage).setItem(KEY, id);
    } catch { /* ignore */ }
  }, []);
  const signOut = useCallback(() => {
    setUserId(null);
    try { window.sessionStorage.removeItem(KEY); window.localStorage.removeItem(KEY); } catch { /* ignore */ }
  }, []);

  const value = useMemo<PersonaCtx>(() => {
    let session: Session;
    let valid = !!userId;
    try { session = sessionFor(userId || FALLBACK); } catch { session = sessionFor(FALLBACK); valid = false; }
    return { session, ready: userId !== undefined, signedIn: valid, setPersona, signOut };
  }, [userId, setPersona, signOut]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePersona(): PersonaCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('usePersona must be used inside <PersonaProvider>');
  return v;
}

/** Home of a portal for a role, used after sign-in. */
export function homeFor(session: Session): string { return session.portal === 'customer' ? '/' : '/ops'; }
