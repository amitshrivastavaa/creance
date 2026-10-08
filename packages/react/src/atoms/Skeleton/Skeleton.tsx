import type { CSSProperties, HTMLAttributes } from 'react';
import { cx } from '../../internal/cx';
import './Skeleton.css';

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  shape?: 'line' | 'block' | 'circle';
}

/**
 * A placeholder while content loads. Hidden from screen readers: mark the loading region with
 * `aria-busy` and announce the result instead.
 */
export function Skeleton({ width, height, shape = 'line', className, style, ...props }: SkeletonProps) {
  return (
    <span
      aria-hidden
      className={cx('cr-skeleton', className)}
      data-shape={shape}
      style={{ width, height, ...style }}
      {...props}
    />
  );
}
