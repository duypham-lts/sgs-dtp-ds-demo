'use client';
// List-page heading from the ListPage template: Breadcrumb → headline-medium title → one-line description,
// one primary action on the right.
import { Breadcrumb, Tag } from '@sgs/graphite';
import type { ReactNode } from 'react';

export function PageHead({ crumbs, title, description, action, noDesign }: {
  crumbs?: { label: string; href?: string }[]; title: string; description?: ReactNode; action?: ReactNode; noDesign?: boolean;
}) {
  return (
    <div className="page-head">
      <div className="page-head__text">
        {crumbs ? <Breadcrumb items={crumbs} /> : null}
        <h1 className="headline-medium page-head__title">{title}</h1>
        {description ? <p className="body-medium page-head__sub">{description}</p> : null}
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
  return <span className="no-design"><Tag tone="required">Chưa có design</Tag></span>;
}
