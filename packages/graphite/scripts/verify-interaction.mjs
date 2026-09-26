// Interaction-equivalence check for behaviour that a static render cannot see (menus that only exist
// once a popover is open, callbacks). Each scenario runs twice in a DOM (happy-dom), once with the
// reference bundle (dist/components/bundle.js) and once with this TypeScript port. After every step the
// two DOMs must be identical and the callbacks must have been called the same way. Each scenario also
// asserts the documented behaviour, so a bug shared by both implementations still fails.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import * as esbuild from 'esbuild';
import { Window } from 'happy-dom';

const pkg = join(dirname(fileURLToPath(import.meta.url)), '..');
const ds = join(pkg, '../../design-system/graphite');
const require = createRequire(import.meta.url);

const win = new Window({ url: 'http://localhost/' });
for (const k of ['window', 'document', 'navigator', 'Node', 'HTMLElement', 'Element', 'Event', 'MouseEvent', 'KeyboardEvent', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame']) {
  const value = k === 'window' ? win : typeof win[k] === 'function' && !/^[A-Z]/.test(k) ? win[k].bind(win) : win[k];
  Object.defineProperty(globalThis, k, { value, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const React = require('react');
const { act } = React;
const { createRoot } = require('react-dom/client');

// Reference implementation (runs in its own context, sharing React and the DOM).
const refWindow = { React };
vm.runInNewContext(readFileSync(join(ds, 'dist/components/bundle.js'), 'utf8'), { window: refWindow, document: win.document });
const Ref = refWindow.Graphite;

// Port.
const built = await esbuild.build({
  entryPoints: [join(pkg, 'src/index.ts')], bundle: true, write: false, format: 'cjs', platform: 'node',
  external: ['react'], logLevel: 'silent',
});
const portModule = { exports: {} };
new Function('module', 'exports', 'require', built.outputFiles[0].text)(portModule, portModule.exports, require);
const Port = portModule.exports;

// React client ids (useId) come from a global counter, so number them in order of appearance.
const normalize = (html) => { const seen = new Map(); return html.replace(/«[^»]+»|:r[0-9a-z]+:|_r_[0-9a-z]+_/g, (m) => { if (!seen.has(m)) seen.set(m, `id${seen.size}`); return seen.get(m); }); };

const notificationItems = [
  { id: 'n1', type: 'action', tone: 'warning', title: 'Documents requested', body: 'SGS needs 2 documents', ref: 'GA-2026-002', time: '09:12', group: 'Today', unread: true, href: '/service-requests/GA-2026-002' },
  { id: 'n2', type: 'status', title: 'Request approved', ref: 'IS-2026-003', time: '22 Sep', group: 'Earlier', unread: false, href: '/service-requests/IS-2026-003' },
];

const scenarios = [
  {
    name: 'TopBar defaults (no app hooks): Profile, Settings, Sign out as plain links',
    props: () => ({ variant: 'home', userName: 'Wei Chen', userEmail: 'wei@abc.com.tw', notificationItems }),
    async run(t) {
      await t.click('.gr-top__user');
      t.expectLinks(['Profile|#', 'Settings|#', 'Sign out|#']);
      t.expect(t.clickLink('Sign out') === false, 'Sign out does not prevent navigation without onSignOut');
    },
  },
  {
    name: 'TopBar accountLinks + onSignOut + signOutLabel',
    props: (log) => ({
      variant: 'home', userName: 'Wei Chen', notificationItems,
      accountLinks: [{ label: 'Settings', href: '/settings' }, { label: 'Help', onClick: () => log.push('help') }],
      onSignOut: () => log.push('signOut'), signOutLabel: 'Log out',
    }),
    async run(t) {
      await t.click('.gr-top__user');
      t.expectLinks(['Settings|/settings', 'Help|#', 'Log out|#']);
      t.expect(t.clickLink('Settings') === false, 'a link without onClick keeps its navigation');
      t.expect(t.clickLink('Help') === true, 'onClick prevents default navigation');
      t.expect(t.clickLink('Log out') === true, 'onSignOut prevents default navigation');
      t.expectLog(['help', 'signOut']);
    },
  },
  {
    name: 'TopBar signOutHref without onSignOut',
    props: () => ({ variant: 'home', userName: 'Wei Chen', notificationItems, signOutHref: '/logout' }),
    async run(t) {
      await t.click('.gr-top__user');
      t.expectLinks(['Profile|#', 'Settings|#', 'Sign out|/logout']);
    },
  },
  {
    name: 'TopBar onNotificationOpen / onMarkAllRead / onNotificationsLoadMore reach NotificationCenter',
    props: (log) => ({
      variant: 'home', userName: 'Wei Chen', notificationItems, notificationsHasMore: true,
      onNotificationOpen: (n) => log.push('open:' + n.id), onMarkAllRead: () => log.push('markAll'), onNotificationsLoadMore: () => log.push('more'),
    }),
    async run(t) {
      await t.click('.gr-top__bell');
      await t.click('.gr-ntf__item');
      t.expectLog(['open:n1']);
      await t.clickText('button', 'All');
      await t.clickText('button', 'Show older notifications');
      t.expectLog(['open:n1', 'more']);
    },
  },
  {
    name: 'TopBar onMarkAllRead',
    props: (log) => ({ variant: 'home', userName: 'Wei Chen', notificationItems, onMarkAllRead: () => log.push('markAll') }),
    async run(t) {
      await t.click('.gr-top__bell');
      await t.click('.gr-ntf__markall');
      t.expectLog(['markAll']);
    },
  },
];

async function play(G, scenario) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  const log = [];
  const snapshots = [];
  const errors = [];
  const snap = () => snapshots.push(normalize(host.innerHTML));
  const t = {
    async click(sel) {
      const el = host.querySelector(sel);
      if (!el) throw new Error(`no element ${sel}`);
      await act(async () => { el.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })); });
      snap();
    },
    async clickText(tag, text) {
      const el = [...host.querySelectorAll(tag)].find((e) => e.textContent.trim().startsWith(text));
      if (!el) throw new Error(`no ${tag} "${text}"`);
      await act(async () => { el.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })); });
      snap();
    },
    /** Clicks an account-menu link; returns whether the default navigation was prevented. */
    clickLink(label) {
      const a = [...host.querySelectorAll('.gr-top__acct-links a')].find((e) => e.textContent === label);
      if (!a) throw new Error(`no account link "${label}"`);
      const ev = new win.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
      act(() => { a.dispatchEvent(ev); });
      return ev.defaultPrevented;
    },
    expectLinks(expected) {
      const got = [...host.querySelectorAll('.gr-top__acct-links a')].map((a) => `${a.textContent}|${a.getAttribute('href')}`);
      if (JSON.stringify(got) !== JSON.stringify(expected)) errors.push(`account links ${JSON.stringify(got)}, expected ${JSON.stringify(expected)}`);
    },
    expectLog(expected) { if (JSON.stringify(log) !== JSON.stringify(expected)) errors.push(`callbacks ${JSON.stringify(log)}, expected ${JSON.stringify(expected)}`); },
    expect(ok, what) { if (!ok) errors.push(what); },
  };
  await act(async () => { root.render(React.createElement(G.TopBar, scenario.props(log))); });
  snap();
  try { await scenario.run(t); } catch (e) { errors.push(e.message); }
  await act(async () => { root.unmount(); });
  host.remove();
  return { snapshots, log, errors };
}

let pass = 0;
const failures = [];
for (const s of scenarios) {
  const a = await play(Ref, s);
  const b = await play(Port, s);
  const problems = [];
  a.snapshots.forEach((html, i) => {
    const other = b.snapshots[i];
    if (html === other) return;
    let j = 0;
    while (html[j] === other?.[j]) j++;
    problems.push(`DOM differs after step ${i} at ${j}\n    ref : …${html.slice(Math.max(0, j - 60), j + 60)}\n    port: …${(other ?? '').slice(Math.max(0, j - 60), j + 60)}`);
  });
  if (JSON.stringify(a.log) !== JSON.stringify(b.log)) problems.push(`callbacks differ: ref ${JSON.stringify(a.log)}, port ${JSON.stringify(b.log)}`);
  for (const e of a.errors) problems.push(`reference: ${e}`);
  for (const e of b.errors) problems.push(`port: ${e}`);
  if (problems.length) failures.push(`${s.name}\n  ${problems.join('\n  ')}`);
  else pass++;
}
console.log(`Interaction check: ${pass} scenarios identical, ${failures.length} different`);
await win.happyDOM.close();
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
