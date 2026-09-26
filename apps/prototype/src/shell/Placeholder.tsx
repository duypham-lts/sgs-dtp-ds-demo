'use client';
// Pages that exist in the navigation but have no design yet (docs/prototype-plan.md, Pha 3 brief).
// They say what will be here and which use cases they cover, so a click never lands on a dead end.
import { Card, EmptyState } from '@sgs/graphite';
import { usePathname } from 'next/navigation';
import { ListLayout } from '@/ui/layout';
import { PageHead } from './PageHead';
import { useSidebar } from './ShellContext';

export function Placeholder({ crumbs, title, description, what, ucs }: { crumbs?: { label: string; href?: string }[]; title: string; description?: string; what: string; ucs: string }) {
  return (
    <ListLayout crumbs={crumbs} title={title} description={description} noDesign>
      <Card extend>
        <EmptyState icon="document" title="This page has no design yet" body={`${what} Use cases: ${ucs}.`} />
      </Card>
    </ListLayout>
  );
}

/** Route that exists in the navigation map (docs/prototype-plan.md §2.3) but is not built yet. */
export function NotBuiltYet() {
  const path = usePathname();
  useSidebar('expanded');
  return (
    <>
      <PageHead title="Not built yet" description={<code>{path}</code>} />
      <Card extend>
        <EmptyState icon="task" title="Màn này sẽ được dựng ở Pha 3" body="Route đã có trong sơ đồ điều hướng. Màn hình theo design sẽ được dựng khi làm module tương ứng." />
      </Card>
    </>
  );
}
