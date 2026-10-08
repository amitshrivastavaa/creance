import { forwardRef, useImperativeHandle, useRef, useState, type ReactNode } from 'react';
import { Input, type InputProps } from '../../atoms/Input';
import { cx } from '../../internal/cx';
import { CrossIcon } from '../../internal/icons';
import './ClearableInput.css';

export interface ClearableInputProps extends InputProps {
  /** Called after the field is cleared. With a controlled `value`, set it to '' here. */
  onClear?: () => void;
  /** Accessible name of the clear button. Default "Clear". */
  clearLabel?: string;
  /** Shown at the start of the field. Decorative. */
  leading?: ReactNode;
  /** Shown before the clear button: a shortcut hint or a spinner. */
  trailing?: ReactNode;
  /** Round ends, for search. */
  shape?: 'rounded' | 'pill';
}

/** A text field with a clear button that appears when there is text, and puts focus back in the field. */
export const ClearableInput = forwardRef<HTMLInputElement, ClearableInputProps>(function ClearableInput(
  { onClear, clearLabel = 'Clear', leading, trailing, shape = 'rounded', className, value, defaultValue, onChange, ...props },
  ref,
) {
  const inner = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inner.current as HTMLInputElement);
  const [own, setOwn] = useState(String(defaultValue ?? ''));
  const text = value === undefined ? own : String(value);

  return (
    <span
      className={cx('cr-clearable', className)}
      data-shape={shape}
      data-leading={leading ? '' : undefined}
      data-empty={text ? undefined : ''}
    >
      {leading && <span className="cr-clearable__leading">{leading}</span>}
      <Input
        ref={inner}
        value={text}
        onChange={(e) => {
          if (value === undefined) setOwn(e.currentTarget.value);
          onChange?.(e);
        }}
        {...props}
      />
      <span className="cr-clearable__trailing">
        {trailing}
        {text && !props.disabled && !props.readOnly && (
          <button
            type="button"
            className="cr-clearable__clear"
            aria-label={clearLabel}
            onClick={() => {
              if (value === undefined) setOwn('');
              onClear?.();
              inner.current?.focus();
            }}
          >
            <CrossIcon />
          </button>
        )}
      </span>
    </span>
  );
});
