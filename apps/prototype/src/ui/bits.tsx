'use client';
// Small layout patterns that repeat across designs/ and have no Graphite component: definition lists,
// the status timeline, the right-hand panel blocks and "name + email" cells.
import { Avatar } from '@sgs/graphite';
import type { CSSProperties, ReactNode } from 'react';

/** <dl> grid: small secondary label over a body-medium value (designs/03 CaUserDetail, 06/07 detail). */
export function Facts({ items, columns = 2, style }: { items: [ReactNode, ReactNode][]; columns?: number; style?: CSSProperties }) {
  return (
    <dl className="facts" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)`, ...style }}>
      {items.map(([k, v], i) => (
        <div key={i}><dt className="body-small facts__k">{k}</dt><dd className="body-medium facts__v">{v}</dd></div>
      ))}
    </dl>
  );
}

/** Inline "label value" pairs in two columns (designs/01 ActivateSuccess, 09 detail). */
export function InlineFacts({ items }: { items: [ReactNode, ReactNode][] }) {
  return (
    <dl className="body-medium inline-facts">
      {items.map(([k, v], i) => [<dt key={`k${i}`}>{k}</dt>, <dd key={`v${i}`}>{v}</dd>])}
    </dl>
  );
}

export interface TimelineStep { title: ReactNode; meta?: ReactNode; state?: 'done' | 'current' | 'todo' | 'error' }
const DOT: Record<NonNullable<TimelineStep['state']>, string> = {
  done: 'var(--support-success)', current: 'var(--brand-orange)', todo: 'var(--border-strong)', error: 'var(--support-error)',
};
/** Vertical status timeline (designs/03 CaUserDetail History, 06/07/08/09 detail). The state is also given
 * as text for screen readers, so it is never colour-only. */
export function Timeline({ steps, label = 'History' }: { steps: TimelineStep[]; label?: string }) {
  return (
    <ol className="timeline" aria-label={label}>
      {steps.map((s, i) => {
        const state = s.state ?? 'done';
        return (
          <li key={i} className="timeline__item" style={{ paddingBottom: i === steps.length - 1 ? 0 : 16 }}>
            {i < steps.length - 1 ? <span aria-hidden="true" className="timeline__line" /> : null}
            <span aria-hidden="true" className="timeline__dot" style={{ background: DOT[state] }} />
            <span className="timeline__text">
              <span className="body-medium" style={{ fontWeight: 500 }}>{s.title}<span className="gr-sr">{` (${state === 'done' ? 'done' : state === 'current' ? 'current step' : state === 'error' ? 'stopped' : 'not yet'})`}</span></span>
              {s.meta ? <span className="body-small timeline__meta">{s.meta}</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** A block in the right-hand panel: title-small + content on layer-01 (designs/03 "What Wei Chen can do"). */
export function AsideBox({ title, children }: { title?: ReactNode; children: ReactNode }) {
  return (
    <div className="aside-box">
      {title ? <span className="title-small">{title}</span> : null}
      {children}
    </div>
  );
}

/** Secondary bullet list inside an AsideBox. */
export function AsideList({ items }: { items: ReactNode[] }) {
  return <ul className="body-small aside-list">{items.map((t, i) => <li key={i}>{t}</li>)}</ul>;
}

/** Avatar + name (link) + email (designs/03 user tables). */
export function PersonCell({ name, sub, href, avatar = true }: { name: string; sub?: ReactNode; href?: string; avatar?: boolean }) {
  return (
    <span className="person-cell">
      {avatar ? <Avatar name={name} size="md" /> : null}
      <span className="two-line">
        {href ? <a href={href} className="gr-link" style={{ fontWeight: 500 }}>{name}</a> : <span style={{ fontWeight: 500 }}>{name}</span>}
        {sub ? <span className="body-small two-line__sub">{sub}</span> : null}
      </span>
    </span>
  );
}

/** Bold first line + secondary second line in a table cell. */
export function TwoLine({ top, sub, href }: { top: ReactNode; sub?: ReactNode; href?: string }) {
  return (
    <span className="two-line">
      {href ? <a href={href} className="gr-link" style={{ fontWeight: 500 }}>{top}</a> : <span style={{ fontWeight: 500 }}>{top}</span>}
      {sub ? <span className="body-small two-line__sub">{sub}</span> : null}
    </span>
  );
}

/** Field-level error for controls without an `error` prop (FileUpload, checkbox groups), styled by the DS
 * field classes: orange, under the control, cleared by the caller on edit. */
export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <div className="gr-field is-error"><div className="gr-field__msg" role="alert">{children}</div></div>;
}

/** KPI tile (designs/04 FwDetail "Content", 08 review tiles). Optional link. */
export function StatTile({ value, label, href }: { value: ReactNode; label: ReactNode; href?: string }) {
  const body = <><span className="headline-small">{value}</span><span className="body-small muted">{label}</span></>;
  return href ? <a href={href} className="stat-tile stat-tile--link">{body}</a> : <div className="stat-tile">{body}</div>;
}

export interface RadioCardOption { value: string; title: ReactNode; sub?: ReactNode; right?: ReactNode; disabled?: boolean }
/** Radio cards of designs/05 (ScopeCreate type, LinkFramework / ChangeTier tier): selected card on
 * background-brand-subtle with an orange inset ring; plain DS radio inside. */
export function RadioCards({ name, legend, required, options, value, onChange, direction = 'column', hideLegend }: {
  name: string; legend: string; required?: boolean; options: RadioCardOption[]; value?: string; onChange: (v: string) => void; direction?: 'row' | 'column'; hideLegend?: boolean;
}) {
  return (
    <fieldset className="radio-cards">
      <legend className={hideLegend ? 'gr-sr' : 'label-small radio-cards__legend'}>{legend}{required ? <> <span className="gr-req">*</span></> : null}</legend>
      <div className={`radio-cards__list radio-cards__list--${direction}`}>
        {options.map((o) => {
          const on = o.value === value;
          return (
            <label key={o.value} className={`radio-card${on ? ' is-on' : ''}${direction === 'row' ? ' radio-card--row' : ''}`} aria-disabled={o.disabled || undefined}>
              <span className="radio-card__main">
                <input type="radio" name={name} className="gr-radio" checked={on} disabled={o.disabled} onChange={() => onChange(o.value)} />
                <span className="two-line"><span className="title-small">{o.title}</span>{o.sub ? <span className="body-small two-line__sub">{o.sub}</span> : null}</span>
              </span>
              {o.right ? <span className="body-medium" style={{ fontWeight: 500 }}>{o.right}</span> : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
