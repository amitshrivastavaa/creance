import { forwardRef, useRef, type ButtonHTMLAttributes } from 'react';
import { cx } from '../../internal/cx';
import { useLiquidGlass } from '../../internal/liquidGlass';
import { mergeRefs } from '../../internal/mergeRefs';
import './Button.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual weight. Use one `primary` per group of actions. */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
}

/** A Liquid Glass control. Primary and danger are tinted glass; ghost has no glass at all. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', type = 'button', className, children, ...props },
  ref,
) {
  const own = useRef<HTMLButtonElement>(null);
  const glass = variant !== 'ghost';
  const lens = useLiquidGlass(own, glass);
  return (
    <button
      ref={mergeRefs(ref, own)}
      type={type}
      className={cx('cr-button', glass && 'cr-glass', className)}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {lens}
      {children}
    </button>
  );
});
