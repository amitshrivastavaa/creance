import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cx } from '../../internal/cx';
import './Button.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual weight. Use one `primary` per group of actions. */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', type = 'button', className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx('cr-button', className)}
      data-variant={variant}
      data-size={size}
      {...props}
    />
  );
});
