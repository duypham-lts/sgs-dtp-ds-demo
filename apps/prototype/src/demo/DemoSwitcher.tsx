'use client';
// Demo tool, not part of the product design: switch persona (role + tenant) and portal, reset the mock
// data, open the component gallery. Fixed top centre, over the empty middle of the TopBar.
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button, Icon } from '@sgs/graphite';
import { listPersonas, resetDb, ROLE_LABEL, portalOf } from '@/mock';
import { DEMO_PASSWORD } from '@/mock/seed';
import { SCENARIO_LABEL, type Scenario } from '@/mock/scenarios';
import { currentScenario } from '@/mock/store';
import { usePersona } from './persona';

export function DemoSwitcher() {
  const { session, setPersona, signedIn } = usePersona();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const personas = listPersonas();
  const customer = personas.filter((p) => portalOf(p.user.role) === 'customer');
  const sgs = personas.filter((p) => portalOf(p.user.role) === 'sgs-ops');
  const orgs = [...new Set(customer.map((p) => p.org))];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onDown = (e: MouseEvent) => { if (panel.current && !panel.current.parentElement!.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onDown); };
  }, [open]);

  function choose(userId: string, role: Parameters<typeof portalOf>[0]) {
    setPersona(userId);
    setOpen(false);
    const home = portalOf(role) === 'customer' ? '/' : '/ops';
    if (!pathname.startsWith('/_components')) router.push(home);
    else router.refresh();
  }

  const row = (p: (typeof personas)[number]) => {
    const current = signedIn && p.user.id === session.user.id;
    return (
      <li key={p.user.id}>
        <button type="button" className="demo__persona" aria-current={current ? 'true' : undefined} onClick={() => choose(p.user.id, p.user.role)}>
          <span className="demo__name">{p.user.displayName}{current ? <span className="gr-sr"> (current)</span> : null}</span>
          <span className="demo__role">{ROLE_LABEL[p.user.role]}{portalOf(p.user.role) === 'sgs-ops' ? ` · ${p.org}` : ''}</span>
          {current ? <Icon name="checkmark" size={16} className="demo__check" /> : null}
        </button>
      </li>
    );
  };

  return (
    <div className="demo" data-theme="customer">
      {open ? (
        <div ref={panel} className="demo__panel" role="dialog" aria-label="Demo: switch persona">
          <div className="demo__panel-head">
            <span className="title-small">Demo · sign in as</span>
            <span className="body-small demo__hint">Prototype only. Replaces Entra sign-in. On the sign-in screens every account uses the password <code>{DEMO_PASSWORD}</code>.</span>
          </div>
          <div className="demo__cols">
            <div>
              <div className="label-medium demo__portal">Customer Portal</div>
              {orgs.map((org) => (
                <div key={org} className="demo__org">
                  <div className="body-small demo__orgname">{org}</div>
                  <ul>{customer.filter((p) => p.org === org).map(row)}</ul>
                </div>
              ))}
            </div>
            <div>
              <div className="label-medium demo__portal">SGS Operations</div>
              <ul>{sgs.map(row)}</ul>
            </div>
          </div>
          <div className="demo__foot">
            <span className="body-small demo__hint" style={{ marginRight: 'auto' }}>Data: {SCENARIO_LABEL[currentScenario()]}</span>
            {(Object.keys(SCENARIO_LABEL) as Scenario[]).map((sc) => (
              <Button key={sc} size="sm" variant="ghost" onClick={() => { resetDb(sc); setOpen(false); router.refresh(); }}>Reset: {SCENARIO_LABEL[sc].toLowerCase()}</Button>
            ))}
            <Button size="sm" variant="tertiary" onClick={() => { setOpen(false); router.push('/mail'); }}>Mailbox</Button>
            <Button size="sm" variant="tertiary" onClick={() => { setOpen(false); router.push('/_components'); }}>Component gallery</Button>
          </div>
        </div>
      ) : null}
      <button type="button" className="demo__toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="demo__tag">Demo</span>
        <span className="demo__who">{signedIn ? `${session.user.displayName} · ${ROLE_LABEL[session.user.role]}` : 'Signed out'}</span>
        <Icon name="chevron--down" size={16} />
      </button>
    </div>
  );
}
