import { useId, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { CrossIcon } from '../../internal/icons';
import './ErrorCard.css';

export interface ErrorCardProps {
  /** What failed and where: "Run 40 failed at step 3". */
  title: ReactNode;
  /** Why, in a sentence. */
  description?: ReactNode;
  /** The raw error, shown in monospace. */
  details?: string;
  /** Next steps: retry, view logs. */
  actions?: ReactNode;
  /** Heading level of the title. Default 3. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

/** A failure that needs a decision: what broke, the error itself, and what you can do next. */
export function ErrorCard({ title, description, details, actions, headingLevel = 3, className }: ErrorCardProps) {
  const id = useId();
  const H = `h${headingLevel}` as const;
  return (
    <section aria-labelledby={id} className={cx('cr-error-card cr-surface', className)}>
      <H id={id} className="cr-error-card__title">
        <CrossIcon />
        {title}
      </H>
      {description && <p className="cr-error-card__description">{description}</p>}
      {details && <pre className="cr-error-card__details">{details}</pre>}
      {actions && <div className="cr-error-card__actions">{actions}</div>}
    </section>
  );
}
