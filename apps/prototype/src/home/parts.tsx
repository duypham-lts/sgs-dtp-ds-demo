'use client';
// Building blocks of the Home dashboards (designs/12-dashboard). Layout values come from the design files.
import { Link, ProgressBar, StatusTag } from '@sgs/graphite';
import type { ReactNode } from 'react';
import { translate } from '@/i18n/locale';
import { STAGES, type AttentionItem, type Phrase, type Stage, type Tile } from '@/mock/api/dashboard';
import { fmtDate, fmtDay } from '@/ui/format';

const DATE_KEYS = new Set(['when', 'date', 'from', 'to']);
const DAY_KEYS = new Set(['day']);
const WORD_KEYS = new Set(['item', 'doc', 'group', 'month']);

export function phraseText(p: Phrase): string {
  if (!p.v) return translate(p.k);
  const v: Record<string, string | number> = {};
  for (const [key, val] of Object.entries(p.v)) {
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val) && DATE_KEYS.has(key)) v[key] = fmtDate(val);
    else if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val) && DAY_KEYS.has(key)) v[key] = fmtDay(val);
    else if (typeof val === 'string' && WORD_KEYS.has(key)) v[key] = translate(val);
    else v[key] = val;
  }
  return translate(p.k, v);
}

export function lineText(fallback: string, parts?: Phrase[], join = ' · '): string {
  if (!parts?.length) return translate(fallback);
  return parts.map(phraseText).join(join);
}

export function DashHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="dash-head">
      <h1 className="headline-medium" style={{ margin: 0 }}>{title}</h1>
      <p className="body-medium muted" style={{ margin: 0 }}>{sub}</p>
    </div>
  );
}

export function Tiles({ tiles }: { tiles: Tile[] }) {
  return (
    <div className="dash-tiles" style={{ gridTemplateColumns: `repeat(${tiles.length}, 1fr)` }}>
      {tiles.map((t) => (
        <a key={t.label} href={t.href} className="dash-tile">
          <span className="headline-medium">{t.value}</span>
          <span className="body-medium" style={{ fontWeight: 500 }}>{translate(t.label)}</span>
          <span className="body-small muted">{lineText(t.sub, t.subParts, t.subJoin ?? ' · ')}</span>
        </a>
      ))}
    </div>
  );
}

export function Section({ title, sub, link, extend, children }: { title: string; sub?: string; link?: { label: string; href: string }; extend?: boolean; children: ReactNode }) {
  return (
    <section className={`gr-card dash-card${extend ? ' gr-card--extend' : ''}`}>
      <div className="gr-card__head">
        <div><h2 className="gr-card__title">{translate(title)}</h2>{sub ? <p className="gr-card__sub">{translate(sub)}</p> : null}</div>
        {link ? <Link href={link.href}>{translate(link.label)}</Link> : null}
      </div>
      {children}
    </section>
  );
}

/** "Needs your attention" / "Next up": tag + two lines + the action in link colour; the whole row is the link. */
export function ActionList({ items, empty }: { items: AttentionItem[]; empty: string }) {
  if (!items.length) return <p className="body-medium muted" style={{ margin: 0 }}>{translate(empty)}</p>;
  return (
    <ul className="dash-list">
      {items.map((a) => (
        <li key={a.id}>
          <a href={a.href} className="dash-row">
            <span style={{ flexShrink: 0 }}><StatusTag status={a.tag[0]} label={translate(a.tag[1])} size="sm" /></span>
            <span className="dash-row__text"><span className="body-medium" style={{ fontWeight: 500 }}>{lineText(a.title, a.titleParts)}</span><span className="body-small muted">{lineText(a.sub, a.subParts)}</span></span>
            <span className="body-small dash-row__cta">{translate(a.cta)}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function StageSteps({ stage }: { stage: Stage }) {
  return (
    <ol className="dash-stage" aria-label={`Stage: ${STAGES[stage]}`}>
      {STAGES.map((n, i) => {
        const done = i < stage, cur = i === stage;
        return (
          <li key={n}>
            <span aria-hidden="true" className="dash-stage__dot" style={{ background: done ? 'var(--support-success)' : cur ? 'var(--brand-orange)' : 'var(--border-subtle-01)' }} />
            <span className="body-small" style={{ fontWeight: cur ? 500 : 400, color: cur || done ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{translate(n)}</span>
            {i < STAGES.length - 1 ? <span aria-hidden="true" className="dash-stage__line" /> : null}
          </li>
        );
      })}
    </ol>
  );
}

export function GroupBars({ items }: { items: { code: string; title: string; progress: number }[] }) {
  return (
    <ul className="dash-groups">
      {items.map((g) => (
        <li key={g.code}>
          <span className="gr-rnav__code" style={{ justifySelf: 'start' }}>{g.code}</span>
          <ProgressBar label={translate(g.title)} value={g.progress} size="sm" />
          <span className="body-small" style={{ textAlign: 'right', fontWeight: 500 }}>{g.progress}%</span>
        </li>
      ))}
    </ul>
  );
}

export function TwoCol({ ratio = '3fr 2fr', children }: { ratio?: string; children: ReactNode }) {
  return <div className="dash-two" style={{ gridTemplateColumns: ratio }}>{children}</div>;
}
