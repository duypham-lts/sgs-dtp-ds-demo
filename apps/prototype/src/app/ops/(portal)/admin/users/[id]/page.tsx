'use client';
import { useParams } from 'next/navigation';
import { SgsUserDetailPage } from '@/features/users/SgsUserDetailPage';

export default function Page() { const { id } = useParams<{ id: string }>(); return <SgsUserDetailPage key={id} id={id} />; }
