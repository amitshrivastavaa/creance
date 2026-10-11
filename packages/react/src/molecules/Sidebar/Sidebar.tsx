'use client';

import { useId, useState, type MouseEventHandler, type ReactNode } from 'react';
import { IconButton } from '../../atoms/IconButton/IconButton';
import { Tooltip } from '../../atoms/Tooltip/Tooltip';
import { cx } from '../../internal/cx';
import { SidebarIcon } from '../../internal/icons';
import './Sidebar.css';

export interface SidebarItem {
  /** Also the tooltip and accessible name when the sidebar is collapsed. */
  label: string;
  href?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  /** The page the person is on. */
  current?: boolean;
  /** Shown beside the label. Collapsed, it becomes a dot. */
  count?: number;
  /** Decorative. Collapsed, a link with no icon shows the first letter of its label. */
  icon?: ReactNode;
}

export interface SidebarGroup {
  /** A heading above the group. */
  title?: string;
  items: SidebarItem[];
}

type Slot = ReactNode | ((state: { collapsed: boolean }) => ReactNode);

export interface SidebarProps {
  groups: SidebarGroup[];
  /** Above the links: a logo or a workspace switcher. A function receives `{ collapsed }`. */
  header?: Slot;
  /** Below the links: the account. A function receives `{ collapsed }`. */
  footer?: Slot;
  /** Shows a button that collapses the sidebar to icons. */
  collapsible?: boolean;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** `flush` has no background of its own, for use inside AppShell. `card` is a glass tile. */
  variant?: 'flush' | 'card';
  /** Accessible name of the nav. Default "Sidebar". */
  label?: string;
  collapseLabel?: string;
  expandLabel?: string;
  className?: string;
}

/** Links down the side of an app, in groups. Collapses to icons; each icon keeps its name as a tooltip and for screen readers. */
export function Sidebar({
  groups,
  header,
  footer,
  collapsible,
  collapsed: controlled,
  defaultCollapsed = false,
  onCollapsedChange,
  variant = 'flush',
  label = 'Sidebar',
  collapseLabel = 'Collapse sidebar',
  expandLabel = 'Expand sidebar',
  className,
}: SidebarProps) {
  const [own, setOwn] = useState(defaultCollapsed);
  const collapsed = controlled ?? own;
  const id = useId();
  const slot = (s: Slot) => (typeof s === 'function' ? s({ collapsed }) : s);

  function toggle() {
    setOwn(!collapsed);
    onCollapsedChange?.(!collapsed);
  }

  return (
    <nav aria-label={label} className={cx('cr-sidebar', variant === 'card' && 'cr-surface', className)} data-collapsed={collapsed || undefined}>
      {header !== undefined && <div className="cr-sidebar__header">{slot(header)}</div>}
      <div className="cr-sidebar__body">
        {groups.map((group, g) => (
          <div key={g} className="cr-sidebar__group">
            {group.title && (
              <p id={`${id}-${g}`} className="cr-sidebar__title">
                {group.title}
              </p>
            )}
            <ul className="cr-sidebar__list" aria-labelledby={group.title ? `${id}-${g}` : undefined}>
              {group.items.map((item, i) => {
                const link = (
                  <a className="cr-sidebar__link" href={item.href} onClick={item.onClick} aria-current={item.current ? 'page' : undefined}>
                    <span className="cr-sidebar__icon" aria-hidden="true">
                      {item.icon ?? item.label.charAt(0)}
                    </span>
                    <span className="cr-sidebar__label">{item.label}</span>
                    {/* The space keeps the count a separate word in the link's accessible name. */}
                    {item.count !== undefined && ' '}
                    {item.count !== undefined && <span className="cr-sidebar__count">{item.count}</span>}
                  </a>
                );
                return (
                  <li key={i}>
                    {collapsed ? (
                      <Tooltip side="right" content={item.count === undefined ? item.label : `${item.label} · ${item.count}`}>
                        {link}
                      </Tooltip>
                    ) : (
                      link
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      {(footer !== undefined || collapsible) && (
        <div className="cr-sidebar__footer">
          {footer !== undefined && <div className="cr-sidebar__footer-slot">{slot(footer)}</div>}
          {collapsible && (
            <IconButton
              size="sm"
              icon={<SidebarIcon />}
              label={collapsed ? expandLabel : collapseLabel}
              aria-expanded={!collapsed}
              tooltip={false}
              onClick={toggle}
            />
          )}
        </div>
      )}
    </nav>
  );
}
