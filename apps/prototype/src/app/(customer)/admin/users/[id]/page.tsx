'use client';
import { useParams } from 'next/navigation';
import { CustomerUserDetailPage } from '@/features/users/CustomerUserDetailPage';

export default function Page() { const { id } = useParams<{ id: string }>(); return <CustomerUserDetailPage key={id} id={id} />; }
