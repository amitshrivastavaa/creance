import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import '../Checkbox/Checkbox.css';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'role'> {
  label: ReactNode;
  description?: ReactNode;
}

/**
 * An on/off setting that applies immediately. A native checkbox with `role="switch"`, so it submits
 * with forms and Space toggles it. Use `Checkbox` when the choice only applies after a Save.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, description, className, ...props },
  ref,
) {
  return (
    <label className={cx('cr-check cr-switch', className)}>
      <span className="cr-check__text">
        {label}
        {description && <span className="cr-check__description">{description}</span>}
      </span>
      <input ref={ref} type="checkbox" role="switch" className="cr-switch__input" {...props} />
    </label>
  );
});
