'use client';
// Page layouts of the designs:
// - ListLayout: heading (Breadcrumb, h1, one line) + a body that fills the remaining height. Sidebar expanded.
// - DetailLayout: PageHeader + grid 14fr 62fr 21fr (SectionNav | numbered cards | right panel), gap 20.
//   The middle and right columns scroll on their own (design-questions Q2); the header stays. Sidebar collapsed.
import { PageHeader, SectionNav, type PageHeaderProps, type SectionNavItem } from '@sgs/graphite';
import { useRouter } from 'next/navigation';
import { useRef, useState, type ReactNode } from 'react';
import { PageHead } from '@/shell/PageHead';
import { useSidebar } from '@/shell/ShellContext';

export function ListLayout({ crumbs, title, description, action, noDesign, children }: {
  crumbs?: { label: string; href?: string }[]; title: string; description?: ReactNode; action?: ReactNode; noDesign?: boolean; children: ReactNode;
}) {
  useSidebar('expanded');
  return (
    <>
      <PageHead crumbs={crumbs} title={title} description={description} action={action} noDesign={noDesign} />
      <div className="list-body">{children}</div>
    </>
  );
}

export function DetailLayout({ header, backHref, sections, activeSection, aside, children, sidebar = 'collapsed' }: {
  header: Omit<PageHeaderProps, 'onBack'> & { onBack?: () => void };
  backHref?: string;
  sections?: SectionNavItem[];
  /** Section shown as current (default: the first). */
  activeSection?: string;
  aside?: ReactNode;
  children: ReactNode;
  sidebar?: 'collapsed' | 'expanded';
}) {
  useSidebar(sidebar);
  const router = useRouter();
  const middle = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(activeSection ?? sections?.[0]?.id);
  const onBack = header.onBack ?? (backHref ? () => router.push(backHref) : undefined);

  // SectionNav scrolls the middle column to the card with the same id (data-section on the card).
  function select(id: string) {
    setActive(id);
    const el = middle.current?.querySelector(`[data-section="${id}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <>
      <PageHeader {...header} onBack={onBack} />
      <div className={`detail-grid${aside === undefined ? ' detail-grid--no-aside' : ''}`}>
        {sections ? (
          <div className="detail-grid__nav">
            <SectionNav label="Sections" items={sections} active={active} onSelect={select} />
          </div>
        ) : null}
        <div ref={middle} className="detail-grid__main">{children}</div>
        {aside !== undefined ? <div className="detail-grid__aside">{aside}</div> : null}
      </div>
    </>
  );
}

/** Numbered card section inside DetailLayout (designs use <section class="gr-card"> with gr-card__num). */
export { Card as Section } from '@sgs/graphite';
