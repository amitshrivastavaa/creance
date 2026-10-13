import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
// The one import Creance's registry asks for. It exists once the smoke test has installed the items.
import '~/lib/creance/tokens.css';

export const metadata: Metadata = { title: 'Creance from the shadcn registry' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
