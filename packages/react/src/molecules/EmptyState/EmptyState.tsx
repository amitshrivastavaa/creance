import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './EmptyState.css';

export interface EmptyStateProps {
  title: ReactNode;
  /** Why it is empty and what will fill it. */
  description?: ReactNode;
  /** The one action that fills it, such as "Start a run". */
  action?: ReactNode;
  /** A decorative illustration or icon. */
  icon?: ReactNode;
  /** Heading level of the title in your page outline. Default 2. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

/** An empty list or page as an invitation to act: what goes here, and how to start. */
export function EmptyState({ title, description, action, icon, headingLevel = 2, className }: EmptyStateProps) {
  const H = `h${headingLevel}` as const;
  return (
    <div className={cx('cr-empty', className)}>
      {icon && (
        <span className="cr-empty__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <H className="cr-empty__title">{title}</H>
      {description && <p className="cr-empty__description">{description}</p>}
      {action}
    </div>
  );
}
