import type { ReactNode } from 'react';
import { Button, type ButtonProps } from '../../atoms/Button';
import { cx } from '../../internal/cx';
import { ChevronDownIcon } from '../../internal/icons';
import { Menu, MenuContent, MenuTrigger } from '../Menu';
import './SplitButton.css';

export interface SplitButtonProps extends Omit<ButtonProps, 'children'> {
  /** The main action. */
  children: ReactNode;
  /** `MenuItem`s for the other ways to do it. */
  menu: ReactNode;
  /** Accessible name of the arrow: "More ways to hand off". */
  menuLabel: string;
}

/** The common action, with related alternatives one click away in a menu. */
export function SplitButton({ children, menu, menuLabel, variant = 'primary', size, className, ...props }: SplitButtonProps) {
  return (
    <span className={cx('cr-split-button', className)} data-variant={variant}>
      <Button variant={variant} size={size} className="cr-split-button__main" {...props}>
        {children}
      </Button>
      <Menu>
        <MenuTrigger asChild>
          <Button variant={variant} size={size} className="cr-split-button__arrow" aria-label={menuLabel}>
            <ChevronDownIcon />
          </Button>
        </MenuTrigger>
        <MenuContent align="end">{menu}</MenuContent>
      </Menu>
    </span>
  );
}
