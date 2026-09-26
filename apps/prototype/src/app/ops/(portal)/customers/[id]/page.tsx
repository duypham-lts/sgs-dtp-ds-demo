'use client';
import { useParams } from 'next/navigation';
import { CustomerDetailPage } from '@/features/customers/CustomerDetailPage';

export default function Page() { const { id } = useParams<{ id: string }>(); return <CustomerDetailPage key={id} id={id} view="overview" />; }
