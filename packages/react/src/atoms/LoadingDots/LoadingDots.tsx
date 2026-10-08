import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './LoadingDots.css';

export interface LoadingDotsProps {
  /** What is happening, in words: "Deploy Fixer is thinking". Announced politely. */
  children: ReactNode;
  tone?: 'default' | 'muted';
  className?: string;
}

/** Three dots that pulse in turn, beside what is happening. They hold still under reduced motion. */
export function LoadingDots({ children, tone = 'default', className }: LoadingDotsProps) {
  return (
    <span role="status" className={cx('cr-loading-dots', className)} data-tone={tone}>
      <span className="cr-loading-dots__dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      {children}
    </span>
  );
}
