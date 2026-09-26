'use client';
import { useParams } from 'next/navigation';
import { AdminReview } from '@/features/consulting/SgsPages';

export default function Page() { const { id } = useParams<{ id: string }>(); return <AdminReview key={id} id={id} category="implementation_support" />; }
