import type { ReactNode } from 'react';

/** One component in a labelled cell. `wide` spans the grid. */
export function Cell({ name, wide, children }: { name: string; wide?: boolean; children: ReactNode }) {
  return (
    <section className="cell cr-surface" data-component={name} data-wide={wide || undefined} aria-label={name}>
      <h3>{name}</h3>
      {children}
    </section>
  );
}
