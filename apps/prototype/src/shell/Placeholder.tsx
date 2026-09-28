'use client';
// Pages that exist in the navigation but have no design yet (docs/prototype-plan.md, Pha 3 brief).
// They say what will be here and which use cases they cover, so a click never lands on a dead end.
import { Card, EmptyState } from '@sgs/graphite';
import { usePathname } from 'next/navigation';
import { translate } from '@/i18n/locale';
import { ListLayout } from '@/ui/layout';
import { PageHead } from './PageHead';
import { useSidebar } from './ShellContext';

export function Placeholder({ crumbs, title, description, what, ucs }: { crumbs?: { label: string; href?: string }[]; title: string; description?: string; what: string; ucs: string }) {
  return (
    <ListLayout crumbs={crumbs} title={title} description={description} noDesign>
      <Card extend>
        <EmptyState icon="document" title={translate('This page has no design yet')} body={translate('{what} Use cases: {ucs}.', { what, ucs })} />
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
        <EmptyState icon="task" title={translate('This screen will be built in phase 3')} body={translate('This route is in the navigation. The designed screen will be built with its module.')} />
      </Card>
    </>
  );
}
