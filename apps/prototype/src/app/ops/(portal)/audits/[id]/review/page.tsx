'use client';
import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { AuditReviewPage } from '@/features/review/AuditorPages';

export default function Page() { const { id } = useParams<{ id: string }>(); return <Suspense><AuditReviewPage key={id} requestId={id} /></Suspense>; }
