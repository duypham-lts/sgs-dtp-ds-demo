'use client';
import { translate } from '@/i18n/locale';
// Invitation email (designs/01 InviteEmail, 720px). The prototype shows sent emails in a demo mailbox
// (/mail); the button opens the activation page of the right portal (UC-USR-003, UC-AUTH-005).
import { Link, Logo } from '@sgs/graphite';
import type { MockEmail } from '@/mock';
import { fmtDate } from '@/ui/format';

export function InviteEmail({ email }: { email: MockEmail }) {
  const href = `${email.portal === 'customer' ? '' : '/ops'}/activate?token=${email.token}`;
  const sgs = email.portal === 'sgs-ops';
  return (
    <div data-theme="customer" className="mail">
      <div className="body-small mail__head">
        <span className="muted">{translate("From: SGS Digital Trust Platform <no-reply@dtp.sgs.com>")}</span>
        <span className="muted">To: {email.to}</span>
        <span className="title-small">Subject: {email.subject}</span>
      </div>
      <div className="mail__card">
        <div className="mail__band" />
        <div className="mail__body">
          <Logo siteName="Digital Trust Platform" siteSub={sgs ? 'Operations Console' : 'Customer Portal'} />
          <h1 className="headline-small" style={{ margin: 0 }}>{sgs ? 'You’re invited to SGS Operations' : `You’re invited to ${email.orgName}`}</h1>
          <p className="body-large" style={{ margin: 0 }}>
            Hi {email.toName},<br />
            {sgs
              ? <>{email.inviterName} ({email.inviterRole}) invited you to the SGS Operations Console of the Digital Trust Platform for <strong>{email.orgName}</strong>.</>
              : <>{email.inviterName} ({email.inviterRole}) invited you to work on compliance evidence for <strong>{email.orgName}</strong> {translate("on the SGS Digital Trust Platform.")}</>}
          </p>
          <div><a href={href} className="gr-btn gr-btn--primary gr-btn--lg">{translate("Activate my account")}</a></div>
          <p className="body-small muted" style={{ margin: 0 }}>This link works once and expires on {fmtDate(email.expiresAt)}. If you didn’t expect this email, you can ignore it.</p>
          <div className="mail__rule" />
          <p className="body-small muted" style={{ margin: 0 }}>SGS Digital Trust Platform · {sgs ? email.orgName : 'SGS Taiwan'} · <Link href="#" inline>{translate("Privacy notice")}</Link></p>
        </div>
      </div>
    </div>
  );
}
