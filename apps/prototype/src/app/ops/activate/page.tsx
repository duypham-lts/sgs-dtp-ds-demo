import { Suspense } from 'react';
import { ActivatePage } from '@/features/auth/ActivatePage';

export default function Page() {
  return <Suspense><ActivatePage portal="sgs-ops" /></Suspense>;
}
