import type { HTMLAttributes } from 'react';
import { cx } from '../../internal/cx';
import './Kbd.css';

export function Kbd({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <kbd className={cx('cr-kbd', className)} {...props} />;
}
