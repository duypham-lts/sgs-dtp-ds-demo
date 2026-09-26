'use client';
import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { CustomerTrainingDetail } from '@/features/certification/Training';

export default function Page() { const { id } = useParams<{ id: string }>(); return <Suspense><CustomerTrainingDetail key={id} id={id} /></Suspense>; }
