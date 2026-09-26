'use client';
import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { WorkspacePage } from '@/features/evidence/WorkspacePage';

export default function Page() { const { id } = useParams<{ id: string }>(); return <Suspense><WorkspacePage key={id} id={id} /></Suspense>; }
