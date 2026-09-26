'use client';
// Shown when a signed-in role opens a page it has no access to (UC-ROL-001). Not in designs/: the
// navigation never links there, but URLs can be typed.
import { Card, EmptyState } from '@sgs/graphite';

export function NotAllowed({ what }: { what: string }) {
  return (
    <Card extend>
      <EmptyState icon="user--access" title="You don’t have access to this page" body={`Your role can’t open ${what}. Ask your administrator if you need it.`} />
    </Card>
  );
}

export function NotFound({ what }: { what: string }) {
  return (
    <Card extend>
      <EmptyState icon="search" title={`This ${what} doesn’t exist`} body={`It may have been removed, or it belongs to an organisation you can’t see.`} />
    </Card>
  );
}
