import { cx } from '../../internal/cx';
import './ProgressBar.css';

export interface ProgressBarProps {
  /** Accessible name, e.g. "Token budget". */
  label: string;
  /** Omit for an indeterminate bar. */
  value?: number;
  max?: number;
  tone?: 'default' | 'warning' | 'danger';
  className?: string;
}

/** Native `<progress>`: role, value and range come for free. */
export function ProgressBar({ label, value, max = 100, tone = 'default', className }: ProgressBarProps) {
  return (
    <progress
      className={cx('cr-progress', className)}
      aria-label={label}
      data-tone={tone}
      max={max}
      value={value === undefined ? undefined : Math.min(value, max)}
    />
  );
}
