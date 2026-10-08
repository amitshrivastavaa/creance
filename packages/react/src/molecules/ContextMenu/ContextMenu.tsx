import * as RadixContextMenu from '@radix-ui/react-context-menu';
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import '../Menu/Menu.css';

/**
 * Radix ContextMenu: opens on right-click, long-press, or Shift+F10 and the Menu key on a focused
 * trigger. Never put an action only here; it must also be reachable another way.
 */
export const ContextMenu = RadixContextMenu.Root;
/** Wraps the element that gets the menu. Use `asChild` with a focusable element. */
export const ContextMenuTrigger = RadixContextMenu.Trigger;

export const ContextMenuContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RadixContextMenu.Content>>(
  function ContextMenuContent({ className, ...props }, ref) {
    return (
      <RadixContextMenu.Portal>
        <RadixContextMenu.Content ref={ref} className={cx('cr-menu cr-popover', className)} {...props} />
      </RadixContextMenu.Portal>
    );
  },
);

export interface ContextMenuItemProps extends ComponentPropsWithoutRef<typeof RadixContextMenu.Item> {
  tone?: 'default' | 'danger';
  shortcut?: ReactNode;
  description?: ReactNode;
}

export const ContextMenuItem = forwardRef<HTMLDivElement, ContextMenuItemProps>(function ContextMenuItem(
  { tone = 'default', shortcut, description, className, children, ...props },
  ref,
) {
  return (
    <RadixContextMenu.Item ref={ref} className={cx('cr-menu__item', className)} data-tone={tone} {...props}>
      <span className="cr-menu__text">
        {children}
        {description && <span className="cr-menu__description">{description}</span>}
      </span>
      {shortcut && <span className="cr-menu__shortcut">{shortcut}</span>}
    </RadixContextMenu.Item>
  );
});

export const ContextMenuSeparator = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RadixContextMenu.Separator>>(
  function ContextMenuSeparator({ className, ...props }, ref) {
    return <RadixContextMenu.Separator ref={ref} className={cx('cr-menu__separator', className)} {...props} />;
  },
);

export const ContextMenuLabel = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RadixContextMenu.Label>>(
  function ContextMenuLabel({ className, ...props }, ref) {
    return <RadixContextMenu.Label ref={ref} className={cx('cr-menu__label', className)} {...props} />;
  },
);
