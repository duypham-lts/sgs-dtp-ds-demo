'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { MockEmail } from '@/mock';
import { getEmail } from '@/mock/api/auth';
import { InviteEmail } from '@/features/auth/InviteEmail';

export default function EmailPage() {
  const { id } = useParams<{ id: string }>();
  const [email, setEmail] = useState<MockEmail | null | undefined>();
  useEffect(() => { setEmail(getEmail(id) ?? null); }, [id]);
  if (email === undefined) return null;
  if (email === null) return <p style={{ padding: 40 }}>Email not found. <a href="/mail">Back to the mailbox</a></p>;
  return <InviteEmail email={email} />;
}
