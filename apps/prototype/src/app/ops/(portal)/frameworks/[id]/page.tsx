'use client';
import { useParams } from 'next/navigation';
import { FrameworkPage } from '@/features/frameworks/FrameworkPage';

export default function Page() { const { id } = useParams<{ id: string }>(); return <FrameworkPage key={id} id={id} view="overview" />; }
