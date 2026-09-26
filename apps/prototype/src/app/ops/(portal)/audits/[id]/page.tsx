'use client';
import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { AuditRequestPage } from '@/features/review/AuditorPages';

export default function Page() { const { id } = useParams<{ id: string }>(); return <Suspense><AuditRequestPage key={id} id={id} /></Suspense>; }
