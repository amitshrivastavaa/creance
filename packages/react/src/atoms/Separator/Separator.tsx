import type { HTMLAttributes } from 'react';
import { cx } from '../../internal/cx';
import './Separator.css';

export interface SeparatorProps extends HTMLAttributes<HTMLElement> {
  orientation?: 'horizontal' | 'vertical';
  /** Decorative separators are hidden from screen readers. Default true. */
  decorative?: boolean;
}

export function Separator({ orientation = 'horizontal', decorative = true, className, ...props }: SeparatorProps) {
  return (
    <div
      className={cx('cr-separator', className)}
      data-orientation={orientation}
      {...(decorative ? { 'aria-hidden': true } : { role: 'separator', 'aria-orientation': orientation })}
      {...props}
    />
  );
}
