import { forwardRef, type ReactNode } from 'react';
import { Button, type ButtonProps } from '../Button/Button';
import { Tooltip } from '../Tooltip/Tooltip';
import { cx } from '../../internal/cx';
import './IconButton.css';

export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'aria-label'> {
  /** Accessible name, also shown as a tooltip. Required: an icon alone has no name. */
  label: string;
  icon: ReactNode;
  /** Show `label` in a tooltip on hover and focus. */
  tooltip?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, icon, tooltip = true, variant = 'ghost', className, ...props },
  ref,
) {
  const button = (
    <Button ref={ref} variant={variant} aria-label={label} className={cx('cr-icon-button', className)} {...props}>
      <span aria-hidden="true" className="cr-icon-button__icon">
        {icon}
      </span>
    </Button>
  );
  return tooltip ? <Tooltip content={label}>{button}</Tooltip> : button;
});
