'use client';

import * as RadixMenu from '@radix-ui/react-dropdown-menu';
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './Menu.css';

/** Radix DropdownMenu: arrow keys move, typing jumps to an item, Escape closes and returns focus. */
export const Menu = RadixMenu.Root;
/** Wraps one button. Use `asChild` with `Button`. */
export const MenuTrigger = RadixMenu.Trigger;
export const MenuGroup = RadixMenu.Group;

export const MenuContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RadixMenu.Content>>(
  function MenuContent({ className, sideOffset = 6, align = 'start', ...props }, ref) {
    return (
      <RadixMenu.Portal>
        <RadixMenu.Content
          ref={ref}
          className={cx('cr-menu cr-popover', className)}
          sideOffset={sideOffset}
          align={align}
          {...props}
        />
      </RadixMenu.Portal>
    );
  },
);

export interface MenuItemProps extends ComponentPropsWithoutRef<typeof RadixMenu.Item> {
  /** `danger` for destructive items such as Stop. Put them last, after a separator. */
  tone?: 'default' | 'danger';
  /** A keyboard shortcut shown at the end, for example `<Kbd>P</Kbd>`. Display only. */
  shortcut?: ReactNode;
  description?: ReactNode;
}

export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(function MenuItem(
  { tone = 'default', shortcut, description, className, children, ...props },
  ref,
) {
  return (
    <RadixMenu.Item ref={ref} className={cx('cr-menu__item', className)} data-tone={tone} {...props}>
      <span className="cr-menu__text">
        {children}
        {description && <span className="cr-menu__description">{description}</span>}
      </span>
      {shortcut && <span className="cr-menu__shortcut">{shortcut}</span>}
    </RadixMenu.Item>
  );
});

export const MenuSeparator = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RadixMenu.Separator>>(
  function MenuSeparator({ className, ...props }, ref) {
    return <RadixMenu.Separator ref={ref} className={cx('cr-menu__separator', className)} {...props} />;
  },
);

export const MenuLabel = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RadixMenu.Label>>(
  function MenuLabel({ className, ...props }, ref) {
    return <RadixMenu.Label ref={ref} className={cx('cr-menu__label', className)} {...props} />;
  },
);
