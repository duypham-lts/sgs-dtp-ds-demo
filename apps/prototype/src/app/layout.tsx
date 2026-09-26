import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@sgs/graphite/tokens.css';
import '@sgs/graphite/styles.css';
import './globals.css';
import { PersonaProvider } from '@/demo/persona';
import { DemoSwitcher } from '@/demo/DemoSwitcher';
import { SnackbarProvider } from '@/ui/snackbar';

export const metadata: Metadata = {
  title: 'Digital Trust Platform · prototype',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Same font request as every designs/*.dc.html board: Roboto, Noto Sans TC for Traditional Chinese. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&family=Noto+Sans+TC:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <PersonaProvider>
          <SnackbarProvider>
            {children}
            <DemoSwitcher />
          </SnackbarProvider>
        </PersonaProvider>
      </body>
    </html>
  );
}
