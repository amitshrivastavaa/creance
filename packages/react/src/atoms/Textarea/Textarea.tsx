import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cx } from '../../internal/cx';
import '../Input/Input.css';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

/** A multi-line text field. Resizes vertically. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { rows = 4, className, ...props },
  ref,
) {
  return <textarea ref={ref} rows={rows} className={cx('cr-input', className)} {...props} />;
});
