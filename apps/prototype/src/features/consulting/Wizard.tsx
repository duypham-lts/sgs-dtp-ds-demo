'use client';
import { translate } from '@/i18n/locale';
// designs/06 MvpWizard1/2, 07 IsWizard1/2. UC-SRQ-001. Two columns (steps | card) by design (design-questions Q1).
// Every change is saved to a draft ("All changes saved"); errors show on Next / Submit and clear on edit.
import { Button, Checkbox, DatePicker, FileUpload, InlineNotification, Link, PageHeader, Radio, SectionNav, Select, Textarea } from '@sgs/graphite';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { getDb, MockApiError, TODAY } from '@/mock';
import { CONSULTING_FRAMEWORKS, SR_META, SUPPORT_OPTIONS } from '@/mock/requestMeta';
import { SCOPE_TYPE_LABEL } from '@/mock/labels';
import { getDraft, linkedWorkspace, saveDraft, submitDraft, type ConsultingDraft } from '@/mock/api/requests';
import { visibleScopeIds } from '@/mock/access';
import { usePersona } from '@/demo/persona';
import { FieldError, RadioCards } from '@/ui/bits';
import { useSidebar } from '@/shell/ShellContext';
import { useSnackbar } from '@/ui/snackbar';
import { NotAllowed } from '@/shell/NotAllowed';
import { CONSULTING_COPY, type ConsultingCategory } from './config';

type Errors = Partial<Record<'serviceFramework' | 'scopeId' | 'goal' | 'delivery' | 'earliestStart' | 'contactUserId' | 'supportNeeded' | 'preferredStart' | 'preferredEnd' | 'consent', string>>;

export function ConsultingWizard({ category }: { category: ConsultingCategory }) {
  useSidebar('collapsed');
  const { session } = usePersona();
  const router = useRouter();
  const params = useSearchParams();
  const snack = useSnackbar();
  const c = CONSULTING_COPY[category];
  const slug = SR_META[category].slug;
  const [id, setId] = useState<string | undefined>(params.get('draft') ?? undefined);
  const [step, setStep] = useState(params.get('step') === '2' ? 2 : 1);
  const [v, setV] = useState<ConsultingDraft>({ contactUserId: session.user.id, delivery: category === 'gap_analysis' ? 'on_site' : undefined });
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState<'saved' | 'saving'>('saved');
  const loaded = useRef(!params.get('draft'));
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load the draft once, when the page opens. Later URL changes (autosave, step) must not overwrite what the
  // user is typing with an older saved copy.
  useEffect(() => {
    const d = params.get('draft');
    if (!d || loaded.current) return;
    getDraft(session, d).then((r) => {
      if (r) setV({ serviceFramework: r.serviceFramework, scopeId: r.scopeId, goal: r.goal, delivery: r.delivery, earliestStart: r.earliestStart, contactUserId: r.contactUserId, supportNeeded: r.supportNeeded, preferredStart: r.preferredStart, preferredEnd: r.preferredEnd, consentWorkspace: r.consentWorkspace, attested: r.attested });
      loaded.current = true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (session.user.role !== 'customer_admin' && session.user.role !== 'customer_user') return <NotAllowed what="service requests" />;

  const db = getDb();
  const scopeIds = visibleScopeIds(db, session);
  const scopes = db.scopes.filter((s) => scopeIds.has(s.id)).map((s) => ({ value: s.id, label: s.name, description: `${SCOPE_TYPE_LABEL[s.type]} scope` }));
  const people = db.users.filter((u) => u.tenantId === session.user.tenantId && u.status === 'active' && u.role !== 'customer_viewer').map((u) => ({ value: u.id, label: u.displayName }));
  const frameworks = CONSULTING_FRAMEWORKS.filter((f) => (category === 'gap_analysis' ? f.ga : f.is));
  const link = linkedWorkspace(db, v.scopeId, v.serviceFramework);
  const scopeName = db.scopes.find((s) => s.id === v.scopeId)?.name;

  // Autosave: the first change creates the draft; later changes update it.
  function update(patch: Partial<ConsultingDraft>, clear: (keyof Errors)[] = []) {
    const next = { ...v, ...patch };
    setV(next);
    if (clear.length) setErrors((e) => { const n = { ...e }; clear.forEach((k) => delete n[k]); return n; });
    if (!loaded.current) return;
    setSaving('saving');
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const rid = await saveDraft(session, category, id, next);
      if (!id) { setId(rid); router.replace(`/service-requests/${slug}/new?draft=${rid}${step === 2 ? '&step=2' : ''}`, { scroll: false }); }
      setSaving('saved');
    }, 300);
  }
  const goStep = (n: number) => { setStep(n); if (id) router.replace(`/service-requests/${slug}/new?draft=${id}${n === 2 ? '&step=2' : ''}`, { scroll: false }); };

  function next() {
    const e: Errors = {};
    if (!v.serviceFramework) e.serviceFramework = 'Choose a framework.';
    if (!v.scopeId) e.scopeId = 'Choose a scope.';
    setErrors(e);
    if (!Object.keys(e).length) goStep(2);
  }
  async function submit() {
    const e: Errors = {};
    if (!v.goal?.trim()) e.goal = category === 'gap_analysis' ? 'Tell SGS what you want to achieve.' : 'Describe the goal and priorities.';
    if (!v.delivery) e.delivery = 'Choose how the work is delivered.';
    if (category === 'gap_analysis') {
      if (!v.earliestStart) e.earliestStart = 'Choose the earliest start.';
      if (!v.contactUserId) e.contactUserId = 'Choose a contact person.';
    } else {
      if (!v.supportNeeded?.length) e.supportNeeded = 'Tick at least one kind of help.';
      if (!v.preferredStart) e.preferredStart = 'Choose a start date.';
      if (!v.preferredEnd) e.preferredEnd = 'Choose an end date.';
      else if (v.preferredStart && v.preferredEnd < v.preferredStart) e.preferredEnd = 'The end must be after the start.';
    }
    if (!v.consentWorkspace || !v.attested) e.consent = 'Tick both boxes to submit the request.';
    setErrors(e);
    if (Object.keys(e).length) return;
    try {
      clearTimeout(timer.current);
      const rid = await saveDraft(session, category, id, v);
      await submitDraft(session, rid);
      snack(`Request submitted. You’ll be notified in the portal when SGS accepts or declines it.`);
      router.push(`/service-requests/${slug}/${rid}`);
    } catch (err) { if (err instanceof MockApiError) snack(err.message); else throw err; }
  }

  const steps = [
    { id: 's1', label: '1. Framework & scope', status: step === 2 || (v.serviceFramework && v.scopeId) ? 'complete' as const : 'incomplete' as const },
    { id: 's2', label: `2. ${c.step2}`, status: step === 2 ? 'incomplete' as const : 'optional' as const },
  ];
  const linkNote = v.scopeId && v.serviceFramework ? (
    <div style={{ maxWidth: 588 }}>
      {link
        ? <InlineNotification kind="info" title="Workspace linked automatically">The consultant reads evidence in your {link.f.shortName} · {scopeName?.replace(/ · Taipei$/, '')} workspace.</InlineNotification>
        : <InlineNotification kind="info" title="No workspace for this framework yet">The consultant works from what you share with them. Link {v.serviceFramework} to {scopeName} in Scopes if you want them to read your evidence.</InlineNotification>}
    </div>
  ) : null;

  return (
    <>
      <PageHeader title={c.wizardTitle} subtitle={`Step ${step} of 2`} onBack={() => router.push(`/service-requests/${slug}`)} status={{ status: 'draft', label: 'Draft', shortLabel: 'Draft' }} autosave={id ? saving : undefined} />
      <div className="wizard">
        <div className="wizard__steps"><SectionNav label="Steps" items={steps} active={`s${step}`} onSelect={(sid) => (sid === 's1' ? goStep(1) : next())} /></div>
        <div className="wizard__main">
          {step === 1 ? (
            <section className="gr-card gr-card--extend">
              <div className="gr-card__head"><div className="gr-card__heading"><span className="gr-card__num" aria-hidden="true">1</span><div><h2 className="gr-card__title">{translate("Framework & scope")}</h2><p className="gr-card__sub">{c.step1Sub}</p></div></div></div>
              {category === 'gap_analysis' ? (
                <>
                  <div className="fw-grid-wrap">
                    <RadioCards name="fw" legend="Framework" required options={frameworks.map((f) => ({ value: f.value, title: f.value, sub: f.description }))} value={v.serviceFramework} onChange={(x) => update({ serviceFramework: x }, ['serviceFramework'])} />
                  </div>
                  <FieldError>{errors.serviceFramework}</FieldError>
                  <Select label="Scope" required size="m" placeholder="Choose a scope" options={scopes} value={v.scopeId ?? ''} error={errors.scopeId} helpText="Only scopes assigned to you are listed. Ask your administrator to add a new one." onChange={(_, x) => update({ scopeId: x }, ['scopeId'])} />
                </>
              ) : (
                <div className="field-row">
                  <Select label="Framework" required size="m" placeholder="Choose a framework" options={frameworks.map((f) => ({ value: f.value, label: f.value }))} value={v.serviceFramework ?? ''} error={errors.serviceFramework} helpText="The standard you want to implement." onChange={(_, x) => update({ serviceFramework: x }, ['serviceFramework'])} />
                  <Select label="Scope" required size="m" placeholder="Choose a scope" options={scopes} value={v.scopeId ?? ''} error={errors.scopeId} helpText="Only scopes assigned to you are listed." onChange={(_, x) => update({ scopeId: x }, ['scopeId'])} />
                </div>
              )}
              {linkNote}
              <div className="wizard__foot"><div /><Button size="md" icon="arrow--right" onClick={next}>{translate("Next")}</Button></div>
            </section>
          ) : (
            <section className="gr-card gr-card--extend">
              <div className="gr-card__head"><div className="gr-card__heading"><span className="gr-card__num" aria-hidden="true">2</span><div><h2 className="gr-card__title">{c.step2}</h2><p className="gr-card__sub">{c.step2Sub}</p></div></div></div>
              <div className="summary-strip">
                <span className="body-medium"><strong>{v.serviceFramework}</strong> · {scopeName?.replace(' · ', ', ')}</span><Link href="#" onClick={(e) => { e.preventDefault(); goStep(1); }}>{translate("Edit")}</Link>
              </div>
              {category === 'implementation_support' ? (
                <fieldset className="plain-fieldset">
                  <legend className="label-small muted" style={{ marginBottom: 4 }}>{translate("What do you need help with?")} <span className="gr-req">*</span></legend>
                  {SUPPORT_OPTIONS.map(([k, sub]) => (
                    <Checkbox key={k} label={`${k} — ${sub}`} checked={!!v.supportNeeded?.includes(k)}
                      onChange={(e) => update({ supportNeeded: e.target.checked ? [...(v.supportNeeded ?? []), k] : (v.supportNeeded ?? []).filter((x) => x !== k) }, ['supportNeeded'])} />
                  ))}
                  <FieldError>{errors.supportNeeded}</FieldError>
                </fieldset>
              ) : null}
              <Textarea label={category === 'gap_analysis' ? 'What do you want to achieve?' : 'Goal and priorities'} required size="l" rows={category === 'gap_analysis' ? 3 : 2}
                placeholder={category === 'gap_analysis' ? 'e.g. Certify the head office by Q2 2027; our biggest concern is supplier management.' : undefined}
                value={v.goal ?? ''} error={errors.goal} onChange={(e) => update({ goal: e.target.value }, ['goal'])} />
              {category === 'gap_analysis' ? (
                <>
                  <fieldset className="plain-fieldset">
                    <legend className="label-small muted">{translate("Delivery")} <span className="gr-req">*</span></legend>
                    <div style={{ display: 'flex', gap: 24 }}>
                      <Radio name="del" label="On site" checked={v.delivery === 'on_site'} onChange={() => update({ delivery: 'on_site' }, ['delivery'])} />
                      <Radio name="del" label="Remote" checked={v.delivery === 'remote'} onChange={() => update({ delivery: 'remote' }, ['delivery'])} />
                    </div>
                    <FieldError>{errors.delivery}</FieldError>
                  </fieldset>
                  <div className="field-row">
                    <DatePicker label="Earliest start" required today={TODAY} min={TODAY} value={v.earliestStart ?? ''} error={errors.earliestStart} onChange={(x) => update({ earliestStart: x }, ['earliestStart'])} />
                    <Select label="Contact person" required size="s" options={people} value={v.contactUserId ?? ''} error={errors.contactUserId} onChange={(_, x) => update({ contactUserId: x }, ['contactUserId'])} />
                  </div>
                </>
              ) : (
                <>
                  <div className="field-row" style={{ alignItems: 'flex-start' }}>
                    <DatePicker label="Preferred start" required today={TODAY} min={TODAY} value={v.preferredStart ?? ''} error={errors.preferredStart} onChange={(x) => update({ preferredStart: x }, ['preferredStart', 'preferredEnd'])} />
                    <DatePicker label="Preferred end" required today={TODAY} min={v.preferredStart || TODAY} value={v.preferredEnd ?? ''} error={errors.preferredEnd} onChange={(x) => update({ preferredEnd: x }, ['preferredEnd'])} />
                    <Select label="Delivery" required size="s" placeholder="Choose" options={[{ value: 'on_site', label: 'On site' }, { value: 'remote', label: 'Remote' }, { value: 'hybrid', label: 'Hybrid' }]} value={v.delivery ?? ''} error={errors.delivery} onChange={(_, x) => update({ delivery: x as ConsultingDraft['delivery'] }, ['delivery'])} />
                  </div>
                  <FileUpload label="Documents to share (optional)" hint="e.g. a previous gap analysis or audit report · up to 20 MB each" />
                </>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 720 }}>
                <Checkbox label={`I allow the assigned SGS consultant to view and download evidence in this workspace until the ${category === 'gap_analysis' ? 'gap analysis' : 'request'} is completed.`} checked={!!v.consentWorkspace} onChange={(e) => update({ consentWorkspace: e.target.checked }, ['consent'])} />
                <Checkbox label="I confirm the information is accurate and I am authorised to request this service." checked={!!v.attested} onChange={(e) => update({ attested: e.target.checked }, ['consent'])} />
                <FieldError>{errors.consent}</FieldError>
              </div>
              <div className="wizard__foot"><div><Button variant="ghost" size="md" onClick={() => goStep(1)}>{translate("Back")}</Button></div><Button size="md" onClick={submit}>{translate("Submit request")}</Button></div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
