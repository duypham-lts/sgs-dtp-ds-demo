import type { ReactNode } from 'react';
import { PortalShell } from '@/shell/PortalShell';
import { ShellProvider } from '@/shell/ShellContext';

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <ShellProvider>
      <PortalShell portal="customer">{children}</PortalShell>
    </ShellProvider>
  );
}
