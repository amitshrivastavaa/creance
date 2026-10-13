import '@creance-ui/tokens/tokens.css';
import '@creance-ui/react/styles.css';
import './app.css';
import type { ReactNode } from 'react';

export const metadata = { title: 'Creance with the Vercel AI SDK', description: 'A real model fixes a sample project; Creance shows its run, asks before it changes anything, and lets you stop it.' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
