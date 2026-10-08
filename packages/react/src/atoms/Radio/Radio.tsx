import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import '../Checkbox/Checkbox.css';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  description?: ReactNode;
}

/** A native radio with its label. Group radios with `RadioGroup` (or a `fieldset` and a shared `name`). */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, description, className, ...props },
  ref,
) {
  return (
    <label className={cx('cr-check', className)}>
      <input ref={ref} type="radio" className="cr-check__input" {...props} />
      <span className="cr-check__text">
        {label}
        {description && <span className="cr-check__description">{description}</span>}
      </span>
    </label>
  );
});
