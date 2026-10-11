'use client';

import { useId, useRef, useState, type KeyboardEvent, type MouseEventHandler, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { CrossIcon, MenuIcon } from '../../internal/icons';
import './Navbar.css';

export interface NavbarItem {
  label: ReactNode;
  href?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  /** The page the person is on. */
  current?: boolean;
  /** A count shown after the label, such as items waiting. */
  count?: number;
}

export interface NavbarProps {
  items: NavbarItem[];
  /** Logo and name, usually a link home. */
  brand?: ReactNode;
  /** The end of the bar: search, buttons, the account. Use one primary button at most. */
  actions?: ReactNode;
  /** `bar` is a floating glass pill. `flush` sits on the page with a line under it. */
  variant?: 'bar' | 'flush';
  /** Accessible name of the nav. Default "Main". */
  label?: string;
  /** Accessible name of the button that opens the links on a narrow bar. Default "Menu". */
  menuLabel?: string;
  className?: string;
}

/** The bar across the top of an app or site. When it gets narrow, the links move into a menu. */
export function Navbar({ items, brand, actions, variant = 'bar', label = 'Main', menuLabel = 'Menu', className }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const toggle = useRef<HTMLButtonElement>(null);

  function onKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Escape' || !open) return;
    setOpen(false);
    toggle.current?.focus();
  }

  return (
    // The key handler closes the open menu from anywhere inside it; the controls themselves are the button and links.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <nav aria-label={label} className={cx('cr-navbar', className)} data-variant={variant} data-open={open || undefined} onKeyDown={onKeyDown}>
      <div className={cx('cr-navbar__inner', variant === 'bar' && 'cr-glass')}>
        {brand && <div className="cr-navbar__brand">{brand}</div>}
        <ul id={listId} className="cr-navbar__links">
          {items.map((item, i) => (
            <li key={i}>
              <a
                className="cr-navbar__link"
                href={item.href}
                aria-current={item.current ? 'page' : undefined}
                onClick={(e) => {
                  item.onClick?.(e);
                  setOpen(false);
                }}
              >
                {item.label}
                {/* The space keeps the count a separate word in the link's accessible name. */}
                {item.count !== undefined && ' '}
                {item.count !== undefined && <span className="cr-navbar__count">{item.count}</span>}
              </a>
            </li>
          ))}
        </ul>
        {actions && <div className="cr-navbar__actions">{actions}</div>}
        <button
          ref={toggle}
          type="button"
          className="cr-navbar__toggle"
          aria-label={menuLabel}
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen(!open)}
        >
          {open ? <CrossIcon /> : <MenuIcon />}
        </button>
      </div>
    </nav>
  );
}
