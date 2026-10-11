import 'creance-tokens/tokens.css';
import 'creance/styles.css';
import './app.css';
import type { ReactNode } from 'react';

export const metadata = { title: 'Creance in Next.js', description: 'Every Creance component rendered by the Next.js App Router.' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
