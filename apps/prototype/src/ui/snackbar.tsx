'use client';
// Feedback after an action (CLAUDE.md): Graphite Snackbar, bottom centre, auto-dismiss after 5 s.
// One message at a time; a new one replaces the current one.
import { Snackbar } from '@sgs/graphite';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface Msg { id: number; message: ReactNode; action?: { label: string; onClick?: () => void } }
const Ctx = createContext<(message: ReactNode, action?: Msg['action']) => void>(() => {});

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<Msg | null>(null);
  const show = useCallback((message: ReactNode, action?: Msg['action']) => setMsg({ id: Date.now(), message, action }), []);
  const close = useCallback(() => setMsg(null), []);
  return (
    <Ctx.Provider value={show}>
      {children}
      {msg ? <Snackbar key={msg.id} message={msg.message} action={msg.action} onClose={close} /> : null}
    </Ctx.Provider>
  );
}

/** `const snack = useSnackbar(); snack('Invitation sent to …')` */
export function useSnackbar() { return useContext(Ctx); }
