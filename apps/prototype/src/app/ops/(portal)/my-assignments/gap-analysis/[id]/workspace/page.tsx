'use client';
import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { ConsultantWorkspace } from '@/features/consulting/ConsultantWorkspace';

export default function Page() { const { id } = useParams<{ id: string }>(); return <Suspense><ConsultantWorkspace key={id} id={id} category="gap_analysis" /></Suspense>; }
