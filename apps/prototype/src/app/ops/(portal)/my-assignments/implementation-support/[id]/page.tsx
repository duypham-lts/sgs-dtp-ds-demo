'use client';
import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { ConsultantDetail } from '@/features/consulting/SgsPages';

export default function Page() { const { id } = useParams<{ id: string }>(); return <Suspense><ConsultantDetail key={id} id={id} category="implementation_support" /></Suspense>; }
