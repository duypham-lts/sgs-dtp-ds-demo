import { Suspense } from 'react';
import { ConsultingWizard } from '@/features/consulting/Wizard';

export default function Page() { return <Suspense><ConsultingWizard category="implementation_support" /></Suspense>; }
