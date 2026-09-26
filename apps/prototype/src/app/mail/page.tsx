'use client';
// Demo mailbox: the emails the mock "sent" (invitations only; email notifications are P2, D11).
// Prototype tool, not a product screen.
import { useEffect, useState } from 'react';
import { Tag } from '@sgs/graphite';
import type { MockEmail } from '@/mock';
import { listEmails } from '@/mock/api/auth';
import { subscribe } from '@/mock/store';
import { fmtDateTime } from '@/ui/format';

export default function MailboxPage() {
  const [emails, setEmails] = useState<MockEmail[]>([]);
  useEffect(() => { const load = () => setEmails(listEmails()); load(); return subscribe(load); }, []);
  return (
    <div data-theme="customer" className="mailbox">
      <div className="mailbox__head">
        <h1 className="headline-small" style={{ margin: 0 }}>Demo mailbox</h1>
        <Tag tone="required">Prototype tool</Tag>
      </div>
      <p className="body-medium muted" style={{ margin: 0 }}>Emails the platform would send. Only invitation emails are in the MVP.</p>
      <ul className="mailbox__list">
        {emails.map((e) => (
          <li key={e.id}>
            <a className="mailbox__item" href={`/mail/${e.id}`}>
              <span className="title-small">{e.subject}</span>
              <span className="body-small muted">To {e.to} · {fmtDateTime(e.sentAt)}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
