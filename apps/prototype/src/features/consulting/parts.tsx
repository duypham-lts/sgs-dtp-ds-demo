'use client';
import { translate } from '@/i18n/locale';
// Pieces shared by the request detail pages of both portals.
import { Avatar, Button, DocumentItem, FileUpload, InlineNotification, Link, Tag, Textarea } from '@sgs/graphite';
import { useState } from 'react';
import { MockApiError, type Session } from '@/mock';
import { respondToInfo, type Person, type RequestView } from '@/mock/api/requests';
import { AsideBox, FieldError } from '@/ui/bits';
import { useFakeDownload } from '@/ui/download';
import { fmtDate, fmtUs, fsize } from '@/ui/format';
import { useSnackbar } from '@/ui/snackbar';
import { NoDesign } from '@/shell/PageHead';

export function PersonBox({ title, person, sub }: { title: string; person: Person; sub?: string }) {
  return (
    <AsideBox title={title}>
      <div className="person-cell"><Avatar name={person.name} size="lg" /><div className="two-line"><span className="body-medium" style={{ fontWeight: 500 }}>{person.name}</span><span className="body-small two-line__sub">{sub ?? person.title ?? person.role}</span></div></div>
      <Link href={`mailto:${person.email}`}>{person.email}</Link>
    </AsideBox>
  );
}

export function HelpBox() {
  const snack = useSnackbar();
  return (
    <AsideBox title="Need help?">
      <span className="body-small muted">{translate("Questions about this request? Contact SGS support and quote the request number.")}</span>
      <div><Button variant="tertiary" size="sm" onClick={() => snack('SGS support: support.tw@sgs.com · +886 2 2793 5000 (sample contact).')}>{translate("Contact support")}</Button></div>
    </AsideBox>
  );
}

export function Note({ label, children }: { label: string; children: string }) {
  return <div className="note-box"><span className="body-small muted">{label}</span><span className="body-medium">{children}</span></div>;
}

export function SgsDocs({ docs, kinds, verb = 'Issued' }: { docs: RequestView['documents']; kinds: string[]; verb?: string }) {
  const download = useFakeDownload();
  return (
    <>
      {docs.filter((d) => kinds.includes(d.kind)).map((d) => (
        <DocumentItem key={d.id} variant="sgs" docType={d.title} fileName={d.fileName} dateLabel={`${verb} ${fmtUs(d.uploadedAt)}`} size={fsize(d.sizeBytes)}
          actions={[{ type: 'open', label: `Open ${d.fileName}`, onClick: () => download(d.fileName) }, { type: 'download', label: `Download ${d.fileName}`, onClick: () => download(d.fileName) }]} />
      ))}
    </>
  );
}

export function SupportTags({ items }: { items?: string[] }) {
  return <div className="btn-row" style={{ gap: 8 }}>{(items ?? []).map((x) => <Tag key={x} tone="neutral">{x}</Tag>)}</div>;
}

/** D3: the customer answers SGS's question (panel modelled on designs/11 CustAwaitingInfo, built with Graphite). */
export function RespondPanel({ session, request }: { session: Session; request: RequestView }) {
  const snack = useSnackbar();
  const q = request.openInfo!;
  const [answer, setAnswer] = useState('');
  const [files, setFiles] = useState<{ fileName: string; sizeBytes: number }[]>([]);
  const [err, setErr] = useState<string>();
  const [key, setKey] = useState(0);
  const canAnswer = request.can.respond;
  return (
    <section className="gr-card respond-card" data-section="info">
      <div className="gr-card__head">
        <div><h2 className="gr-card__title">{translate("SGS requested more information")}</h2><p className="gr-card__sub">{q.askedByName} · {q.askedByRole} · {fmtDate(q.askedAt)}{q.dueOn ? ` · answer by ${fmtDate(q.dueOn)}` : ''}</p></div>
        <NoDesign />
      </div>
      <div className="respond-card__question body-medium">{q.question}</div>
      {canAnswer ? (
        <>
          <Textarea label="Your answer" required size="l" rows={3} value={answer} error={err} onChange={(e) => { setAnswer(e.target.value); setErr(undefined); }} />
          <FileUpload key={key} label="Files (optional)" hint="Shared with SGS on this request · up to 20 MB each"
            onFilesAdded={(l) => { const add = Array.from(l).map((x) => ({ fileName: x.name, sizeBytes: x.size })); setFiles((f) => [...f, ...add]); }}
            onRemove={(r) => setFiles((f) => f.filter((x) => x.fileName !== r.name))} />
          <div className="btn-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="body-small muted">{translate("Your answer is added to the request and sent to SGS.")}</span>
            <Button size="md" icon="send" iconPosition="left" onClick={async () => {
              if (!answer.trim()) { setErr('Write your answer.'); return; }
              try { await respondToInfo(session, request.id, { answer, files }); snack('Answer sent. SGS continues with your request.'); setAnswer(''); setFiles([]); setKey((k) => k + 1); }
              catch (e) { if (e instanceof MockApiError) setErr(e.message); else throw e; }
            }}>{translate("Send answer")}</Button>
          </div>
        </>
      ) : <InlineNotification kind="info" title="Waiting for your organisation">{translate("A Customer Admin or User with access to this scope can answer.")}</InlineNotification>}
    </section>
  );
}
