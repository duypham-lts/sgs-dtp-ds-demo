'use client';
// List-page heading from the ListPage template: Breadcrumb → headline-medium title → one-line description,
// one primary action on the right.
import { Breadcrumb, Tag } from '@sgs/graphite';
import type { ReactNode } from 'react';
import { translate } from '@/i18n/locale';

export function PageHead({ crumbs, title, description, action, noDesign }: {
  crumbs?: { label: string; href?: string }[]; title: string; description?: ReactNode; action?: ReactNode; noDesign?: boolean;
}) {
  return (
    <div className="page-head">
      <div className="page-head__text">
        {crumbs ? <Breadcrumb items={crumbs.map((c) => ({ ...c, label: translate(c.label) }))} /> : null}
        <h1 className="headline-medium page-head__title">{translate(title)}</h1>
        {description ? <p className="body-medium page-head__sub">{typeof description === 'string' ? translate(description) : description}</p> : null}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {noDesign ? <NoDesign /> : null}
        {action}
      </div>
    </div>
  );
}

/** Marker for screens built without a design (docs/decisions.md → "Màn dựng bù"). */
export function NoDesign() {
  return <span className="no-design"><Tag tone="required">{translate('No design yet')}</Tag></span>;
}
