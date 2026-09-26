'use client';
import { useParams } from 'next/navigation';
import { ScopeDetailPage } from '@/features/scopes/ScopeDetailPage';

export default function Page() { const { id } = useParams<{ id: string }>(); return <ScopeDetailPage key={id} id={id} />; }
