'use client';
import { useParams } from 'next/navigation';
import { CustomerConsultingDetail } from '@/features/consulting/CustomerDetail';

export default function Page() { const { id } = useParams<{ id: string }>(); return <CustomerConsultingDetail key={id} id={id} category="gap_analysis" />; }
