'use client';
import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { AuditFindingsPage } from '@/features/review/AuditorPages';

export default function Page() { const { id } = useParams<{ id: string }>(); return <Suspense><AuditFindingsPage key={id} requestId={id} /></Suspense>; }
