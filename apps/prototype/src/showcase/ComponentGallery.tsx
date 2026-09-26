'use client';
// /_components: every Graphite component, rendered from the official DS previews
// (design-system/graphite/components/<Name>/preview.html) through the TypeScript port in packages/graphite.
import { useMemo, useState, type ReactNode } from 'react';
import { Icon, Logo, Radio, SearchInput, Tag } from '@sgs/graphite';
import { demos, iconNames, type DemoEntry } from './registry';

type Theme = 'customer' | 'sgs-ops' | 'inverse';
const THEMES: { id: Theme; label: string }[] = [
  { id: 'customer', label: 'Customer Portal' },
  { id: 'sgs-ops', label: 'SGS Operations' },
  { id: 'inverse', label: 'Inverse surface' },
];
const GROUP_ORDER = ['Actions', 'Forms', 'Selection', 'Status', 'Feedback', 'Overlay', 'Navigation', 'Data', 'Containers', 'Patterns', 'Foundations', 'Page templates'];

function IconsDemo() {
  return (
    <div className="gr-demo">
      <div className="gr-demo__cap">{iconNames.length} icons (IconName) · 20px · @carbon/icons v11</div>
      <div className="sc-icons">
        {iconNames.map((n) => (
          <div key={n} className="sc-icon"><Icon name={n} size={20} /><code>{n}</code></div>
        ))}
      </div>
    </div>
  );
}

function LogoDemo() {
  return (
    <div className="gr-demo">
      <div className="gr-demo__cap">Customer Portal · Operations Console</div>
      <div className="gr-demo__row">
        <Logo siteName="Digital Trust Platform" siteSub="Customer Portal" />
        <Logo siteName="Digital Trust Platform" siteSub="Operations Console" />
      </div>
    </div>
  );
}

const EXTRA: DemoEntry[] = [
  { name: 'Icon', group: 'Foundations', height: 0, width: 0, page: false, description: 'Carbon icons used by every component. Status is never shown by colour alone: pair the icon with text, or give an icon-only control an accessible name.', Demo: IconsDemo },
  { name: 'Logo', group: 'Foundations', height: 0, width: 0, page: false, description: 'SGS wordmark with the site name. Temporary until the SGSlogo_Final SVG is exported (Open question #13).', Demo: LogoDemo },
];

/** README first paragraphs use **bold**, *italic* and `code`; render just those. */
function inlineMd(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).filter(Boolean).map((part, i) =>
    part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part.startsWith('*') && part.length > 2 ? <em key={i}>{part.slice(1, -1)}</em>
      : part.startsWith('`') ? <code key={i}>{part.slice(1, -1)}</code>
      : part);
}

export function ComponentGallery() {
  const [theme, setTheme] = useState<Theme>('customer');
  const [q, setQ] = useState('');
  const all = useMemo(() => [...demos, ...EXTRA], []);
  const shown = all.filter((d) => !q || d.name.toLowerCase().includes(q.toLowerCase()) || d.group.toLowerCase().includes(q.toLowerCase()));
  const groups = GROUP_ORDER.map((g) => ({ g, items: shown.filter((d) => d.group === g) }))
    .concat([{ g: 'Other', items: shown.filter((d) => !GROUP_ORDER.includes(d.group)) }])
    .filter((x) => x.items.length);
  const componentCount = all.filter((d) => d.group !== 'Page templates').length;

  return (
    <div data-theme="customer" className="sc">
      <header className="sc__head">
        <div>
          <h1 className="headline-medium sc__title">Graphite components</h1>
          <p className="body-medium sc__sub">
            {componentCount} components and {all.length - componentCount} page templates from <code>packages/graphite</code>, the TypeScript port of
            <code> design-system/graphite/dist</code>. Each demo is the official preview from <code>design-system/graphite/components/&lt;Name&gt;/preview.html</code>.
          </p>
        </div>
        <div className="sc__controls">
          <fieldset className="sc__themes">
            <legend className="label-small">Theme</legend>
            {THEMES.map((t) => (
              <Radio key={t.id} name="theme" label={t.label} checked={theme === t.id} onChange={() => setTheme(t.id)} />
            ))}
          </fieldset>
          <SearchInput label="Filter components" placeholder="Filter by name or group" size="s" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </header>

      <div className="sc__body">
        <nav className="sc__toc" aria-label="Components">
          {groups.map(({ g, items }) => (
            <div key={g} className="sc__toc-group">
              <div className="label-medium sc__toc-label">{g}</div>
              <ul>{items.map((d) => <li key={d.name}><a href={`#${d.name}`} className="body-medium">{d.name}</a></li>)}</ul>
            </div>
          ))}
        </nav>

        <main className="sc__main">
          {groups.map(({ g, items }) => (
            <section key={g} aria-labelledby={`g-${g}`} className="sc__group">
              <h2 id={`g-${g}`} className="title-large sc__group-title">{g}</h2>
              {items.map((d) => (
                <article key={d.name} id={d.name} className="sc__card">
                  <div className="sc__card-head">
                    <h3 className="title-medium">{d.name}</h3>
                    {d.page ? <Tag tone="info">Page template · {d.width}×{d.height}</Tag> : null}
                  </div>
                  {d.description ? <p className="body-small sc__desc">{inlineMd(d.description)}</p> : null}
                  {d.page ? (
                    <div className="sc__page" style={{ height: d.height * 0.6 }}>
                      <div data-theme={theme === 'inverse' ? 'customer' : theme} style={{ width: d.width, height: d.height, transform: 'scale(0.6)', transformOrigin: 'top left' }}>
                        <d.Demo />
                      </div>
                    </div>
                  ) : (
                    <div data-theme={theme} className="sc__frame">
                      <d.Demo />
                    </div>
                  )}
                </article>
              ))}
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
