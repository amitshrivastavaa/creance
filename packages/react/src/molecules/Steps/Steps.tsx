import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { CheckIcon, CrossIcon } from '../../internal/icons';
import { VisuallyHidden } from '../../internal/VisuallyHidden';
import './Steps.css';

export type StepStatus = 'done' | 'current' | 'upcoming' | 'error';

export interface StepItem {
  title: ReactNode;
  description?: ReactNode;
  /** Overrides the status worked out from `current`. Use `error` for a step that failed. */
  status?: StepStatus;
}

export interface StepsProps {
  steps: StepItem[];
  /** Index of the step in progress. Earlier steps are done, later ones are upcoming. Pass `steps.length` when all are done. Default 0. */
  current?: number;
  /** A narrow horizontal list stacks vertically by itself. */
  orientation?: 'horizontal' | 'vertical';
  /** Accessible name of the list. Default "Progress". */
  label?: string;
  /** What screen readers hear for each status. */
  statusLabels?: Partial<Record<StepStatus, string>>;
  className?: string;
}

const defaults: Record<StepStatus, string> = { done: 'Done', current: 'Current step', upcoming: 'Not started', error: 'Failed' };

/** Where someone is in a fixed sequence. Each status has a shape and a spoken label, not only a colour. */
export function Steps({ steps, current = 0, orientation = 'horizontal', label = 'Progress', statusLabels, className }: StepsProps) {
  const names = { ...defaults, ...statusLabels };
  return (
    <div className={cx('cr-steps', className)} data-orientation={orientation}>
      <ol className="cr-steps__list" aria-label={label}>
        {steps.map((step, i) => {
          const status = step.status ?? (i < current ? 'done' : i === current ? 'current' : 'upcoming');
          return (
            <li key={i} className="cr-steps__step" data-status={status} aria-current={status === 'current' ? 'step' : undefined}>
              <span className="cr-steps__rail">
                <span className="cr-steps__marker" aria-hidden="true">
                  {status === 'done' ? <CheckIcon /> : status === 'error' ? <CrossIcon /> : i + 1}
                </span>
                <span className="cr-steps__line" aria-hidden="true" />
              </span>
              <span className="cr-steps__text">
                <span className="cr-steps__title">
                  {step.title}
                  <VisuallyHidden>, {names[status]}</VisuallyHidden>
                </span>
                {step.description && <span className="cr-steps__description">{step.description}</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
