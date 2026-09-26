'use client';
// Graphite renders plain <a href> links (AppSidebar, TopBar, NotificationCenter, Link). This wrapper turns
// clicks on same-origin links into client-side navigation, so the real href stays for accessibility
// (open in new tab, screen readers) and the app does not reload.
import { useRouter } from 'next/navigation';
import type { ReactNode, MouseEvent } from 'react';

export function SpaLinks({ children, className, style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  const router = useRouter();
  function onClickCapture(e: MouseEvent<HTMLDivElement>) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null;
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    const href = a.getAttribute('href') ?? '';
    if (!href.startsWith('/')) return; // '#', mailto:, external: leave to the component / browser
    e.preventDefault();
    router.push(href);
  }
  return <div className={className} style={style} onClickCapture={onClickCapture}>{children}</div>;
}
