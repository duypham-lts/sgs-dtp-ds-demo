'use client';
// Internal notes on a service request: the rules of designs/11 (Roles, States) on Graphite.CommentThread, limited
// by decisions D7 to SGS-internal notes. Every entry is hatched as internal; the customer never loads them.
// Read only once the request is closed ("sealed"). TODO(decision D7): shared messages wait for the client.
import { Card, CommentThread, Skeleton } from '@sgs/graphite';
import type { Session } from '@/mock';
import { addRequestNote, listRequestNotes, notesOpen, type RequestView } from '@/mock/api/requests';
import { useMockQuery } from '@/mock/react';
import { fmtDate } from '@/ui/format';

export function InternalNotes({ session, request, number }: { session: Session; request: RequestView; number?: number }) {
  const q = useMockQuery(() => listRequestNotes(session, request.id), [session.user.id, request.id]);
  const open = notesOpen(request.status);
  return (
    <Card number={number} title="Internal notes" subtitle="Only SGS can see these notes. The customer is never shown them." extend>
      {/* CommentThread keeps `messages` as its initial state (Q31), so it mounts once the notes are loaded. */}
      {!q.data ? <Skeleton lines={3} /> : <CommentThread key={request.id} currentUser={session.user.displayName} currentRole="sgs" readOnly={!open} maxHeight={360}
        placeholder="Add a note — only SGS can see it" composerLabel="Internal note"
        emptyTitle="No internal notes yet" emptyBody={open ? 'Use notes to hand over context to colleagues.' : 'This request is closed.'}
        messages={q.data.map((n) => ({ id: n.id, author: n.author, role: 'sgs' as const, roleLabel: n.roleLabel, internal: true, time: `${fmtDate(n.at).slice(0, 6)}, ${n.at.slice(11, 16)}`, body: n.body }))}
        onSend={async (text) => { await addRequestNote(session, request.id, text); }} />}
    </Card>
  );
}
