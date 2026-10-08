import { cloneElement, useId, type ReactElement, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { AlertIcon } from '../../internal/icons';
import './Field.css';

interface ControlProps {
  id?: string;
  disabled?: boolean;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
}

export interface FieldProps {
  label: ReactNode;
  /** Help that stays visible. */
  hint?: ReactNode;
  /** What is wrong and how to fix it. Marks the control invalid. */
  error?: ReactNode;
  /** One control: `Input`, `Textarea`, `Select` or your own. It receives `id`, `aria-describedby` and `aria-invalid`. */
  children: ReactElement<ControlProps>;
  className?: string;
}

/** A label, a control, and the hint or error that describes it, wired together for screen readers. */
export function Field({ label, hint, error, children, className }: FieldProps) {
  const auto = useId();
  const id = children.props.id ?? auto;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [children.props['aria-describedby'], errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cx('cr-field', className)} data-disabled={children.props.disabled || undefined}>
      <label className="cr-field__label" htmlFor={id}>
        {label}
      </label>
      {cloneElement(children, {
        id,
        'aria-describedby': describedBy,
        ...(error ? { 'aria-invalid': true } : {}),
      })}
      {error && (
        <span id={errorId} className="cr-field__error">
          <AlertIcon />
          {error}
        </span>
      )}
      {hint && (
        <span id={hintId} className="cr-field__hint">
          {hint}
        </span>
      )}
    </div>
  );
}
