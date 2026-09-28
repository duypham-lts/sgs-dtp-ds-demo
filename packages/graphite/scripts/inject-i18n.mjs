// Re-apply UI translation hooks after scripts/port-bundle.mjs regenerates src/components.
// Idempotent: a replacement is skipped once its result is already in the file.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '../src/components');

const files = {
  Button: [
    ["import { cx, omit } from '../utils';", "import { cx, omit } from '../utils';\nimport { tr } from '../tr';"],
    [',p.children,pos', ',tr(p.children),pos'],
  ],
  FormField: [
    ["import { cx } from '../utils';", "import { cx } from '../utils';\nimport { tr } from '../tr';"],
    ["},p.label,p.required?", "},tr(p.label),p.required?"],
    ["},msg):null);}", "},tr(msg)):null);}"],
  ],
  Modal: [
    ["import { cx } from '../utils';", "import { cx } from '../utils';\nimport { tr } from '../tr';"],
    ["},p.title),p.onClose?h(IconButton,{icon:'close',label:'Close'", "},tr(p.title)),p.onClose?h(IconButton,{icon:'close',label:tr('Close')"],
    ["},sa.label):null,", "},tr(sa.label)):null,"],
    ["},pa.label):null):null));}", "},tr(pa.label)):null):null));}"],
  ],
  EmptyState: [
    ["import { cx } from '../utils';", "import { cx } from '../utils';\nimport { tr } from '../tr';"],
    ["},p.title),p.body?h('div',{className:'gr-empty__body'},p.body)", "},tr(p.title)),p.body?h('div',{className:'gr-empty__body'},tr(p.body))"],
  ],
  StatusTag: [
    ["import { cx } from '../utils';", "import { cx } from '../utils';\nimport { tr } from '../tr';"],
    ['var label=p.label||def[0];', 'var label=tr(p.label||def[0]);'],
  ],
  Tag: [
    ["import { cx } from '../utils';", "import { cx } from '../utils';\nimport { tr } from '../tr';"],
    ['},p.children);}', '},tr(p.children));}'],
  ],
  Link: [
    ["import { cx, omit } from '../utils';", "import { cx, omit } from '../utils';\nimport { tr } from '../tr';"],
    ['),p.children);}', '),tr(p.children));}'],
  ],
  InlineNotification: [
    ["import { cx } from '../utils';", "import { cx } from '../utils';\nimport { tr } from '../tr';"],
    ["},p.title):null,", "},tr(p.title)):null,"],
    ["},p.children):null,", "},tr(p.children)):null,"],
    ['h(\'span\',null,it)', 'h(\'span\',null,tr(it))'],
    ["label:'Dismiss'", "label:tr('Dismiss')"],
  ],
  Checkbox: [
    ["import { cx, omit } from '../utils';", "import { cx, omit } from '../utils';\nimport { tr } from '../tr';"],
    ["},p.label):null);};}", "},tr(p.label)):null);};}"],
  ],
  OverflowMenu: [
    ["import { cx } from '../utils';", "import { cx } from '../utils';\nimport { tr } from '../tr';"],
    ["label:p.label||'More actions'", "label:tr(p.label||'More actions')"],
    ['}},it.label));}', '}},tr(it.label)));}'],
  ],
  Tabs: [
    ["import { cx } from '../utils';", "import { cx } from '../utils';\nimport { tr } from '../tr';"],
    ['}},t.label,t.badge', '}},tr(t.label),t.badge'],
  ],
  PageHeader: [
    ["import { cx } from '../utils';", "import { cx } from '../utils';\nimport { tr } from '../tr';"],
    ["label:p.backLabel||'Back'", "label:tr(p.backLabel||'Back')"],
    ["h('h1',{className:'gr-ph__title'},p.title)", "h('h1',{className:'gr-ph__title'},tr(p.title))"],
    ["h('p',{className:'gr-ph__sub'},p.subtitle)", "h('p',{className:'gr-ph__sub'},tr(p.subtitle))"],
    ['label:compact&&p.status.shortLabel?p.status.shortLabel:p.status.label', 'label:tr(compact&&p.status.shortLabel?p.status.shortLabel:p.status.label)'],
    ['h(Icon,{name:sv[0],size:16}),sv[1])', 'h(Icon,{name:sv[0],size:16}),tr(sv[1]))'],
  ],
  Card: [
    ["import { cx } from '../utils';", "import { cx } from '../utils';\nimport { tr } from '../tr';"],
    ["'Step '+p.number+': '", "tr('Step {number}: ',{number:p.number})"],
    [':null,p.title),p.subtitle?h(\'p\',{className:\'gr-card__sub\'},p.subtitle)', ':null,tr(p.title)),p.subtitle?h(\'p\',{className:\'gr-card__sub\'},tr(p.subtitle))'],
  ],
  Snackbar: [
    ["import { cx } from '../utils';", "import { cx } from '../utils';\nimport { tr } from '../tr';"],
    ["},p.message),", "},tr(p.message)),"],
    ['},p.action.label)', '},tr(p.action.label))'],
    ["'aria-label':'Dismiss'", "'aria-label':tr('Dismiss')"],
  ],
  Select: [
    ["import { cx } from '../utils';", "import { cx } from '../utils';\nimport { tr } from '../tr';"],
    ["sel?sel.label:h('span',{className:'gr-ms__ph'},p.placeholder||'Select...')", "sel?tr(sel.label):h('span',{className:'gr-ms__ph'},tr(p.placeholder||'Select...'))"],
    ["},o.label,o.description?h('span',{className:'gr-list__desc'},o.description)", "},tr(o.label),o.description?h('span',{className:'gr-list__desc'},tr(o.description))"],
  ],
  MultiSelect: [
    ["import { cx } from '../utils';", "import { cx } from '../utils';\nimport { tr } from '../tr';"],
    ["return c.label;}).join(', ')):h('span',{className:'gr-ms__ph'},p.placeholder||'Select...')", "return tr(c.label);}).join(', ')):h('span',{className:'gr-ms__ph'},tr(p.placeholder||'Select...'))"],
    ["},c.label,h('button',{type:'button',className:'gr-chip__x','aria-label':'Remove '+c.label", "},tr(c.label),h('button',{type:'button',className:'gr-chip__x','aria-label':tr('Remove {name}',{name:c.label})"],
  ],
  Combobox: [
    ["import { cx } from '../utils';", "import { cx } from '../utils';\nimport { tr } from '../tr';"],
    ["},o.label,o.description?h('span',{className:'gr-list__desc'},o.description)", "},tr(o.label),o.description?h('span',{className:'gr-list__desc'},tr(o.description))"],
    ["p.emptyText||'No matches'", "tr(p.emptyText||'No matches')"],
  ],
  SectionNav: [
    ["import { cx } from '../utils';", "import { cx } from '../utils';\nimport { tr } from '../tr';"],
    ["'aria-label':p.label||'Sections'", "'aria-label':tr(p.label||'Sections')"],
    ["h('span',{className:'gr-snav__label'},it.label)", "h('span',{className:'gr-snav__label'},tr(it.label))"],
    ["' – '+st[1]", "' – '+tr(st[1])"],
  ],
  Breadcrumb: [
    ["import { cx } from '../utils';", "import { cx } from '../utils';\nimport { tr } from '../tr';"],
    ["'aria-label':p.label||'Breadcrumb'", "'aria-label':tr(p.label||'Breadcrumb')"],
    ["},it.label):h(Link,{href:it.href||'#'},it.label)", "},tr(it.label)):h(Link,{href:it.href||'#'},tr(it.label))"],
  ],
  Pagination: [
    ["import { cx } from '../utils';", "import { cx } from '../utils';\nimport { tr } from '../tr';"],
    ["'aria-label':p.label||'Pagination'", "'aria-label':tr(p.label||'Pagination')"],
    ["h('span',{className:'gr-pg__text'},'Items per page')", "h('span',{className:'gr-pg__text'},tr('Items per page'))"],
    ["from+'–'+to+' of '+total+' items'", "tr('{from}–{to} of {total} items',{from:from,to:to,total:total})"],
    ["'aria-label':'Page'", "'aria-label':tr('Page')"],
    ["'of '+pages+(pages===1?' page':' pages')", "tr(pages===1?'of {count} page':'of {count} pages',{count:pages})"],
    ["label:'Previous page'", "label:tr('Previous page')"],
    ["label:'Next page'", "label:tr('Next page')"],
  ],
  AppSidebar: [
    ["import { cx } from '../utils';", "import { cx } from '../utils';\nimport { tr } from '../tr';"],
    ["it.badgeLabel||'items'", "tr(it.badgeLabel||'items')"],
    ['h(\'span\',{className:\'gr-side__label\'},it.label)', 'h(\'span\',{className:\'gr-side__label\'},tr(it.label))'],
    ['h(Tooltip,{label:it.label},link)', 'h(Tooltip,{label:tr(it.label)},link)'],
    ['h(Popover,{label:it.label,title:it.label', 'h(Popover,{label:tr(it.label),title:tr(it.label)'],
    ["'aria-label':it.label", "'aria-label':tr(it.label)"],
    ['},ch.label)', '},tr(ch.label))'],
    ['},s.label)', '},tr(s.label))'],
    ["label:collapsed?'Expand sidebar':'Collapse sidebar'", "label:tr(collapsed?'Expand sidebar':'Collapse sidebar')"],
    ["'aria-label':p.label||'Main'", "'aria-label':tr(p.label||'Main')"],
  ],
  Table: [
    ["import { cx } from '../utils';", "import { cx } from '../utils';\nimport { tr } from '../tr';"],
    ['export function cellValue(col,row){return col.render?col.render(row):row[col.key];}', 'export function cellValue(col,row){var v=col.render?col.render(row):row[col.key];return typeof v===\'string\'?tr(v):v;}'],
    ['},c.header);}', '},tr(c.header));}'],
  ],
  Drawer: [
    ["import { cx } from '../utils';", "import { cx } from '../utils';\nimport { tr } from '../tr';"],
    ["},p.title),p.subtitle?h('div',{className:'gr-drawer__sub'},p.subtitle)", "},tr(p.title)),p.subtitle?h('div',{className:'gr-drawer__sub'},tr(p.subtitle))"],
    ["label:'Close'", "label:tr('Close')"],
  ],
  TextInput: [
    ["import { omit } from '../utils';", "import { omit } from '../utils';\nimport { tr } from '../tr';"],
    ["shown?'Hide password':'Show password',title:shown?'Hide password':'Show password'", "tr(shown?'Hide password':'Show password'),title:tr(shown?'Hide password':'Show password')"],
  ],
  DataTable: [
    ["import { cx } from '../utils';", "import { cx } from '../utils';\nimport { tr } from '../tr';"],
    ["'aria-label':'Bulk actions'", "'aria-label':tr('Bulk actions')"],
    ["selIds.length+' selected'", "tr('{count} selected',{count:selIds.length})"],
    ['}},a.label);})', '}},tr(a.label));})'],
    ["},'Cancel'))", "},tr('Cancel')))"],
    ["h('h3',{className:'gr-dt__title'},p.title)", "h('h3',{className:'gr-dt__title'},tr(p.title))"],
    ["h('p',{className:'gr-dt__desc'},p.description)", "h('p',{className:'gr-dt__desc'},tr(p.description))"],
    ["placeholder:p.searchPlaceholder||'Search',label:'Search '+(p.title||'table')", "placeholder:tr(p.searchPlaceholder||'Search'),label:tr('Search {title}',{title:p.title||'table'})"],
    ["title:p.error.title||'Couldn’t load data'", "title:tr(p.error.title||'Couldn’t load data')"],
    ["p.error.message||null", "tr(p.error.message)||null"],
    ["q?'No results for “'+q+'”':(es.title||'Nothing here yet')", "q?tr('No results for “{query}”',{query:q}):tr(es.title||'Nothing here yet')"],
    ["q?'Try a different search term.':(es.body||'')", "q?tr('Try a different search term.'):tr(es.body||'')"],
    ["h(Checkbox,{'aria-label':'Select row'", "h(Checkbox,{'aria-label':tr('Select row')"],
    ["label:'Row actions'", "label:tr('Row actions')"],
    ["h('dt',null,c.header)", "h('dt',null,tr(c.header))"],
    ["h('caption',{className:'gr-sr'},p.title||'Table')", "h('caption',{className:'gr-sr'},tr(p.title||'Table'))"],
    ["'aria-label':'Select all rows on this page'", "'aria-label':tr('Select all rows on this page')"],
    ['}},c.header,h(Icon', '}},tr(c.header),h(Icon'],
    [':c.header);})', ':tr(c.header));})'],
    ["h('span',{className:'gr-sr'},'Actions')", "h('span',{className:'gr-sr'},tr('Actions'))"],
  ],
};

let failed = 0;
for (const [name, rules] of Object.entries(files)) {
  const path = join(root, name + '.ts');
  let src = readFileSync(path, 'utf8');
  for (const [from, to] of rules) {
    if (!src.includes(from)) {
      if (!src.includes(to)) {
        console.error('MISSING in ' + name + ': ' + from.slice(0, 120));
        failed++;
      }
      continue;
    }
    src = src.split(from).join(to);
  }
  writeFileSync(path, src);
}
if (failed) process.exit(1);
console.log('i18n hooks applied to ' + Object.keys(files).length + ' components');
