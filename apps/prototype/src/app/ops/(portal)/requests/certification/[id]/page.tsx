'use client';
import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { SgsCertRequestDetail } from '@/features/certification/SgsCert';

export default function Page() { const { id } = useParams<{ id: string }>(); return <Suspense><SgsCertRequestDetail key={id} id={id} /></Suspense>; }
