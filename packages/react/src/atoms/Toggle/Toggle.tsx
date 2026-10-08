import { forwardRef, useState, type ButtonHTMLAttributes } from 'react';
import { cx } from '../../internal/cx';
import './Toggle.css';

export interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  size?: 'sm' | 'md';
}

/** A button that stays on or off, such as Wrap lines. Ink when on; announced as pressed. */
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  { pressed, defaultPressed = false, onPressedChange, size = 'md', className, onClick, ...props },
  ref,
) {
  const [own, setOwn] = useState(defaultPressed);
  const on = pressed ?? own;
  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={on}
      className={cx('cr-toggle', className)}
      data-size={size}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (pressed === undefined) setOwn(!on);
        onPressedChange?.(!on);
      }}
      {...props}
    />
  );
});
