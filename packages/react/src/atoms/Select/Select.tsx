import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cx } from '../../internal/cx';
import { ChevronDownIcon } from '../../internal/icons';
import '../Input/Input.css';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: 'sm' | 'md';
}

/** A native select, styled. The operating system draws the menu, so it works everywhere, including on phones. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { size = 'md', className, children, ...props },
  ref,
) {
  return (
    <span className={cx('cr-select', className)}>
      <select ref={ref} className="cr-input" data-size={size} {...props}>
        {children}
      </select>
      <ChevronDownIcon />
    </span>
  );
});
