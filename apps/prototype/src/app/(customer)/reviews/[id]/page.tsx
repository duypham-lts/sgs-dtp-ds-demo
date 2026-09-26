'use client';
import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { ReviewFeedbackPage } from '@/features/review/customerReview';

export default function Page() { const { id } = useParams<{ id: string }>(); return <Suspense><ReviewFeedbackPage key={id} id={id} /></Suspense>; }
