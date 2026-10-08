import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './Checkbox.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  description?: ReactNode;
}

/** A native checkbox with its label. The whole row is the click target. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, className, ...props },
  ref,
) {
  return (
    <label className={cx('cr-check', className)}>
      <input ref={ref} type="checkbox" className="cr-check__input" {...props} />
      <span className="cr-check__text">
        {label}
        {description && <span className="cr-check__description">{description}</span>}
      </span>
    </label>
  );
});
