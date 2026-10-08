import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { CopyButton } from '../CopyButton';
import './TextWithCopy.css';

export interface TextWithCopyProps {
  /** The exact text copied. */
  value: string;
  /** What shows, if different from `value`: a truncated ID, say. Defaults to `value`. */
  children?: ReactNode;
  /** Accessible name of the copy button. */
  label?: string;
  /** `inline` sits in a sentence; `block` is a full-width well, for commands. */
  variant?: 'inline' | 'block';
  className?: string;
}

/** Text in monospace with a copy button beside it. */
export function TextWithCopy({ value, children, label = 'Copy', variant = 'inline', className }: TextWithCopyProps) {
  return (
    <span className={cx('cr-text-copy', className)} data-variant={variant}>
      <code className="cr-text-copy__text">{children ?? value}</code>
      <CopyButton value={value} label={label} />
    </span>
  );
}
