'use client';
import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { CustomerCertDetail } from '@/features/certification/CustomerCert';

export default function Page() { const { id } = useParams<{ id: string }>(); return <Suspense><CustomerCertDetail key={id} id={id} /></Suspense>; }
