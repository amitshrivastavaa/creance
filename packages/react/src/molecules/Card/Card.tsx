import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../internal/cx';
import './Card.css';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** `article` for self-contained items in a list; `section` for a titled region; `div` otherwise. */
  as?: 'div' | 'article' | 'section';
}

/** A glass tile for grouping related content inside a window. */
export const Card = forwardRef<HTMLElement, CardProps>(function Card({ as: Tag = 'div', className, ...props }, ref) {
  return <Tag ref={ref as never} className={cx('cr-card cr-surface', className)} {...props} />;
});
