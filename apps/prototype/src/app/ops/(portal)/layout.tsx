import type { ReactNode } from 'react';
import { PortalShell } from '@/shell/PortalShell';
import { ShellProvider } from '@/shell/ShellContext';

export default function OpsLayout({ children }: { children: ReactNode }) {
  return (
    <ShellProvider>
      <PortalShell portal="sgs-ops">{children}</PortalShell>
    </ShellProvider>
  );
}
