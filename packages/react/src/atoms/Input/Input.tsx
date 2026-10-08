import { forwardRef, type InputHTMLAttributes } from 'react';
import { cx } from '../../internal/cx';
import './Input.css';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md';
}

/** A text field. Pair it with `Field` for a label, hint and error, or give it an `aria-label`. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = 'md', type = 'text', className, ...props },
  ref,
) {
  return <input ref={ref} type={type} className={cx('cr-input', className)} data-size={size} {...props} />;
});
