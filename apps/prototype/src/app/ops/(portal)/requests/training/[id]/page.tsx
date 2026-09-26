'use client';
import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { SgsTrainingDetail } from '@/features/certification/Training';

export default function Page() { const { id } = useParams<{ id: string }>(); return <Suspense><SgsTrainingDetail key={id} id={id} /></Suspense>; }
