import type { Metadata } from 'next';
import { ComponentGallery } from '@/showcase/ComponentGallery';

export const metadata: Metadata = { title: 'Graphite components · DTP prototype' };

// Route /_components (the %5F prefix makes Next serve a URL segment that starts with "_").
export default function Page() {
  return <ComponentGallery />;
}
