import { cx } from '../../internal/cx';
import './Spinner.css';

export interface SpinnerProps {
  /** When set, the spinner is announced as a status. Leave unset when visible text already says what is loading. */
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function Spinner({ label, size = 'md', className }: SpinnerProps) {
  const svg = (
    <svg className="cr-spinner__svg" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="6" fill="none" strokeWidth="2" className="cr-spinner__track" />
      <path d="M8 2a6 6 0 0 1 6 6" fill="none" strokeWidth="2" strokeLinecap="round" className="cr-spinner__arc" />
    </svg>
  );
  return label ? (
    <span role="status" className={cx('cr-spinner', className)} data-size={size}>
      {svg}
      <span className="cr-visually-hidden">{label}</span>
    </span>
  ) : (
    <span className={cx('cr-spinner', className)} data-size={size} aria-hidden="true">
      {svg}
    </span>
  );
}
